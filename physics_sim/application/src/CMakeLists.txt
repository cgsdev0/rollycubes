INCLUDE_DIRECTORIES(
${BULLET_PHYSICS_SOURCE_DIR}/src
)

LINK_LIBRARIES(
	BulletDynamics BulletCollision LinearMath Bullet3Common
)

ADD_EXECUTABLE(PhysicsSim
	Simulator.cpp
	lib/LoadMeshFromCollada.cpp
	lib/tinyxml2.cpp
)
