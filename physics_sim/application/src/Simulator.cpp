#include "btBulletDynamicsCommon.h"
#include <stdio.h>
#include "lib/b3BulletDefaultFileIO.h"
#include <cmath>
#include <vector>
#include "lib/tiny_obj_loader.h"

/* btVector3 vtov(GLInstanceVertex v) */
/* { */
/* 	return btVector3(v.xyzw[0], v.xyzw[1], v.xyzw[2]); */
/* } */

struct Snapshot
{
	int frame;
	btVector3 linearVel, angularVel;
	btVector3 linearAcc, angularAcc;
	btVector3 position;
	btQuaternion rotation;
};

void printv3(const btVector3& a)
{
	printf("%f,%f,%f,", float(a.getX()), float(a.getY()), float(a.getZ()));
}
void printq(const btQuaternion& a)
{
	btScalar z, y, x;
	a.getEulerZYX(z, y, x);
	printf("%f,%f,%f,%f,", float(x), float(y), float(z), float(a.getW()));
}
void printSnap(const Snapshot& a)
{
	printf("%d,", a.frame);
	printv3(a.position);
	printq(a.rotation);
	printv3(a.linearVel);
	printv3(a.linearAcc);
	printv3(a.angularVel);
	printv3(a.angularAcc);
}

struct Keyframer
{
	btVector3 lastLinearVel, lastAngularVel;
	btVector3 lastLinearAcc, lastAngularAcc;
	std::vector<Snapshot> keyframes;
};

bool isApproxZero(const btVector3& a, float threshold = 0.000005)
{
	return abs(a.getX()) < threshold && abs(a.getY()) < threshold && abs(a.getZ()) < threshold;
}

int main(int argc, char** argv)
{
	int i;
	///-----initialization_start-----

	///collision configuration contains default setup for memory, collision setup. Advanced users can create their own configuration.
	btDefaultCollisionConfiguration* collisionConfiguration = new btDefaultCollisionConfiguration();

	///use the default collision dispatcher. For parallel processing you can use a diffent dispatcher (see Extras/BulletMultiThreaded)
	btCollisionDispatcher* dispatcher = new btCollisionDispatcher(collisionConfiguration);

	///btDbvtBroadphase is a good general purpose broadphase. You can also try out btAxis3Sweep.
	btBroadphaseInterface* overlappingPairCache = new btDbvtBroadphase();

	///the default constraint solver. For parallel processing you can use a different solver (see Extras/BulletMultiThreaded)
	btSequentialImpulseConstraintSolver* solver = new btSequentialImpulseConstraintSolver;

	btDiscreteDynamicsWorld* dynamicsWorld = new btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);

	dynamicsWorld->setGravity(btVector3(0, -10, 0));

	///-----initialization_end-----

	{
		//keep track of the shapes, we release memory at exit.
		//make sure to re-use collision shapes among rigid bodies whenever possible!
		btAlignedObjectArray<btCollisionShape*> collisionShapes;
		//the ground is a cube of side 100 at position y = -56.
		//the sphere will hit it at y = -6, with center at -5
		/* for (int k = 0; k < visualShapes.size(); ++k) */
		{
			/* GLInstanceGraphicsShape& shape = visualShapes.at(k); */
			btCollisionShape* groundShape = new btBoxShape(btVector3(10, 1, 10));
			groundShape->setMargin(0.01);

			collisionShapes.push_back(groundShape);

			btTransform groundTransform;
			groundTransform.setIdentity();
			groundTransform.setOrigin(btVector3(0, -3.6, 0));

			btScalar mass(0.);

			//rigidbody is dynamic if and only if mass is non zero, otherwise static
			bool isDynamic = (mass != 0.f);

			btVector3 localInertia(0, 0, 0);
			btDefaultMotionState* myMotionState = new btDefaultMotionState(groundTransform);
			btRigidBody::btRigidBodyConstructionInfo rbInfo(mass, myMotionState, groundShape, localInertia);
			btRigidBody* body = new btRigidBody(rbInfo);

			//add the body to the dynamics world
			dynamicsWorld->addRigidBody(body);
		}

		for (int j = 0; j < 2; ++j)
		{
			//create a dynamic rigidbody

			btCollisionShape* colShape = new btBoxShape(btVector3(0.2, 0.21, 0.22));
			colShape->setMargin(0.01);
			//btCollisionShape* colShape = new btSphereShape(btScalar(1.));
			collisionShapes.push_back(colShape);

			/// Create Dynamic Objects
			btTransform startTransform;
			startTransform.setIdentity();

			btScalar mass(1.f);

			//rigidbody is dynamic if and only if mass is non zero, otherwise static
			bool isDynamic = (mass != 0.f);

			btVector3 localInertia(0, 0, 0);
			if (isDynamic)
				colShape->calculateLocalInertia(mass, localInertia);

			startTransform.setOrigin(btVector3(static_cast<float>(j) * 0.2, 2 + static_cast<float>(j) * 0.25, static_cast<float>(j) * 0.13));

			//using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
			btDefaultMotionState* myMotionState = new btDefaultMotionState(startTransform);
			btRigidBody::btRigidBodyConstructionInfo rbInfo(mass, myMotionState, colShape, localInertia);
			btRigidBody* body = new btRigidBody(rbInfo);

			dynamicsWorld->addRigidBody(body);
		}  /// Do some simulation

		///-----stepsimulation_start-----
		int frame = 0;
		Keyframer framer[2];
		int settledFrames = 0;
		while (++frame)
		{
			dynamicsWorld->stepSimulation(1.f / 60.f, 10, 1 / 60.f);
			int stoppedCount = 0;

			//print positions of all objects
			for (int j = dynamicsWorld->getNumCollisionObjects() - 1; j >= 0; j--)
			{
				btCollisionObject* obj = dynamicsWorld->getCollisionObjectArray()[j];
				btRigidBody* body = btRigidBody::upcast(obj);
				btTransform trans;
				if (body && body->getMotionState())
				{
					body->getMotionState()->getWorldTransform(trans);
				}
				else
				{
					trans = obj->getWorldTransform();
				}
				if (j)
				{
					Keyframer& state = framer[j - 1];
					btVector3 linearAcc = (state.lastLinearVel - body->getLinearVelocity());
					btVector3 angularAcc = (state.lastAngularVel - body->getAngularVelocity());

					btVector3 linearImpulse = (state.lastLinearAcc - linearAcc);
					btVector3 angularImpulse = (state.lastAngularAcc - angularAcc);
					if (1 || !isApproxZero(linearImpulse, 0.01) || !isApproxZero(angularImpulse, 0.01))
					{
						Snapshot snap;
						snap.frame = frame;
						snap.linearAcc = linearAcc;
						snap.linearVel = body->getLinearVelocity();
						snap.angularAcc = angularAcc;
						snap.angularVel = body->getAngularVelocity();
						snap.position = trans.getOrigin();
						snap.rotation = trans.getRotation();
						state.keyframes.push_back(snap);
					}

					// update state
					state.lastLinearAcc = linearAcc;
					state.lastAngularAcc = angularAcc;
					//printv3(lastAngular - body->getAngularVelocity());
					state.lastLinearVel = body->getLinearVelocity();
					state.lastAngularVel = body->getAngularVelocity();

					if (isApproxZero(body->getLinearVelocity()) && isApproxZero(body->getAngularVelocity()))
					{
						stoppedCount++;
						//printf("world pos object %d = %f,%f,%f\n", j, float(trans.getOrigin().getX()), float(trans.getOrigin().getY()), float(trans.getOrigin().getZ()));
						if (stoppedCount == 2 && frame > 10)
						{
							settledFrames++;
							if (settledFrames > 1000)
							{
								goto loopbreak;
							}
						}
					}
					else
					{
						settledFrames = 0;
					}
				}
			}
		}

	loopbreak:
		// render output
		for (i = 0; i < 2; ++i)
		{
			// Clear final frame of vel / accel
			framer[i].keyframes[framer[i].keyframes.size() - 1].linearAcc = btVector3();
			framer[i].keyframes[framer[i].keyframes.size() - 1].angularAcc = btVector3();
			framer[i].keyframes[framer[i].keyframes.size() - 1].linearVel = btVector3();
			framer[i].keyframes[framer[i].keyframes.size() - 1].angularVel = btVector3();

			for (int j = 0; j < framer[i].keyframes.size(); ++j)
			{
				printSnap(framer[i].keyframes[j]);
			}
			printf("\n");
		}
		///-----stepsimulation_end-----

		//cleanup in the reverse order of creation/initialization

		///-----cleanup_start-----

		//remove the rigidbodies from the dynamics world and delete them
		for (i = dynamicsWorld->getNumCollisionObjects() - 1; i >= 0; i--)
		{
			btCollisionObject* obj = dynamicsWorld->getCollisionObjectArray()[i];
			btRigidBody* body = btRigidBody::upcast(obj);
			if (body && body->getMotionState())
			{
				delete body->getMotionState();
			}
			dynamicsWorld->removeCollisionObject(obj);
			delete obj;
		}

		//delete collision shapes
		for (int j = 0; j < collisionShapes.size(); j++)
		{
			btCollisionShape* shape = collisionShapes[j];
			collisionShapes[j] = 0;
			delete shape;
		}

		//delete dynamics world
		delete dynamicsWorld;

		//delete solver
		delete solver;

		//delete broadphase
		delete overlappingPairCache;

		//delete dispatcher
		delete dispatcher;

		delete collisionConfiguration;
	}
}
