#!/usr/bin/env python3

import json
import asyncio
import websockets
import sys
import curses
import curses.textpad
import os
import binascii

SERVER_DOMAIN = "insecure-as-heck.thedicega.me"
SERVER_WS = "ws://"+SERVER_DOMAIN+"/ws/"

queue = asyncio.Queue()

async def redirect(action, ws, state):
    state['room'] = action['room']
    await ws.close()

async def welcome(action, ws, state):
    chat = state['game']['chat']
    state['game'] = action['game']
    if 'chat' not in state['game']:
        state['game']['chat'] = chat
    state['game']['chat'].insert(0, "Joined room: " + state['room'])
    state['self_index'] = action['id']

async def join(action, ws, state):
    if action['id'] >= len(state['game']['players']):
        state['game']['players'].append({'name': '', 'score': 0, 'win_count': 0, 'connected': True})

async def disconnect(action, ws, state):
    state['game']['players'][action['id']]['connected'] = False

async def reconnect(action, ws, state):
    state['game']['players'][action['id']]['connected'] = True

async def roll(action, ws, state):
    state['game']['rolls'] = action['rolls']
    state['game']['rolled'] = True

async def update(action, ws, state):
    state['game']['players'][action['id']]['score'] = action['score']

async def update_turn(action, ws, state):
    state['game']['rolled'] = False
    state['game']['used'] = [False] * len(state['game']['used'])
    state['game']['turn_index'] = action['id']

async def chat(action, ws, state):
    state['game']['chat'].insert(0, action['msg'])

async def kick(action, ws, state):
    # Mega hack: reconnect to avoid computing
    ws.close()

async def leave(action, ws, state):
    # Mega hack: reconnect to avoid computing
    ws.close()

async def roll_again(action, ws, state):
    state['game']['rolled'] = False
    state['game']['used'] = [False] * len(state['game']['used'])

async def update_name(action, ws, state):
    state['game']['players'][action['id']]['name'] = action['name']

async def win(action, ws, state):
    state['game']['players'][action['id']]['win_count'] += 1
    state['game']['victory'] = True

async def restart(action, ws, state):
    state['game']['used'] = [False] * len(state['game']['used'])
    for player in state['game']['players']:
        player['score'] = 0
    turn_index += 1
    turn_index %= len(state['game']['players'])
    victory = False
    pass

ACTION_MAP = {
    'redirect': redirect,
    'welcome': welcome,
    'join': join,
    'reconnect': reconnect,
    'disconnect': disconnect,
    'roll': roll,
    'update': update,
    'update_turn': update_turn,
    'chat': chat,
    'kick': kick,
    'leave': leave,
    'roll_again': roll_again,
    'update_name': update_name,
    'win': win,
    'restart': restart,
}

async def handle_action(action, ws, state):
    #scr.addstr(json.dumps(action))
    await ACTION_MAP[action['type']](action, ws, state)

async def consumer_handler(websocket, ui, state):
    async for message in websocket:
        action = json.loads(message)
        if 'error' in action:
            if state['game']['chat'] and state['game']['chat'][0] == action['error']:
                pass
            else:
                state['game']['chat'].insert(0, action['error'])
                ui.render(state)
        else:
            await handle_action(action, websocket, state)
            ui.render(state)

async def producer_handler(ws, ui, state):
    while True:
        action = await queue.get()
        await ws.send(json.dumps(action))

def user_input(ui, state):
    ch = sys.stdin.read(1)
    ui.validate(ch, state)

async def handler(uri, ui, state):
    async with websockets.connect(uri, extra_headers=[('Cookie', '_session=nomnom')]) as websocket:
        consumer_task = asyncio.ensure_future(
            consumer_handler(websocket, ui, state))
        producer_task = asyncio.ensure_future(
            producer_handler(websocket, ui, state))
        done, pending = await asyncio.wait(
            [consumer_task, producer_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()

class GameUI:
    def __init__(self, scr):
        self.scr = scr
        h, w = scr.getmaxyx()
        self.main = curses.newwin(h-1, w-42, 0, 0)
        self.players = curses.newwin(10, 35, 0, w-36)
        self.dice = curses.newwin(10, 35, 11, w-36)
        self.inp = curses.newwin(1, w, h-1, 0)
        self.tb = curses.textpad.Textbox(self.inp)
        #self.tb.edit(self.validate)

    def render(self, state):
        wh, ww = self.main.getmaxyx()
        self.main.erase()
        for i, chat in enumerate(state['game']['chat']):
            self.main.insstr(wh - (i + 1), 0, chat)
            if i + 1 >= wh:
                break
        self.main.refresh()
        self.players.erase()
        self.players.insstr(1, 1, "  ---------- PLAYERS ----------  ")
        ph, pw = self.players.getmaxyx()
        for i, player in enumerate(state['game']['players']):
            name = player['name']
            if name == "":
                name = "User"+str(i+1)
            turn_str = "  "
            if state['game']['turn_index'] == i:
                turn_str = "> "
            col = curses.color_pair(1)
            if state['game']['victory'] and state['game']['turn_index'] == i:
                col = curses.color_pair(3)
            if not player['connected']:
                col = curses.color_pair(2)
            self.players.insstr(3 + i, 1, turn_str + name, col)
            self.players.insstr(3 + i, pw-(3 + len(str(player['score']))), str(player['score']))
        self.players.refresh()
        self.dice.erase()
        self.dice.insstr(1, 1, "  ----------- DICE ------------  ")
        self.dice.insstr(2, 1, "                                 ")
        self.dice.insstr(3, 1, "     /-------\    /-------\      ")
        self.dice.insstr(4, 1, "     |       |    |       |      ")
        self.dice.insstr(5, 1, "     |       |    |       |      ")
        self.dice.insstr(6, 1, "     |       |    |       |      ")
        self.dice.insstr(7, 1, "     \-------/    \-------/      ")
        pips = []
        pips.append([(4, 8), (4, 12), (5, 8), (5, 10), (5, 12), (6, 8), (6, 12)])
        pips.append([(y, x + 13) for (y, x) in pips[0]])
        rolls = {
            1: [3],
            2: [0, 6],
            3: [0, 3, 6],
            4: [0, 1, 5, 6],
            5: [0, 1, 3, 5, 6],
            6: [0, 1, 2, 4, 5, 6]
        }
        for i, r in enumerate(state['game']['rolls']):
            for c in rolls[r]:
                self.dice.delch(*pips[i][c])
                self.dice.insch(*pips[i][c], 'o')
        self.dice.refresh()
        self.inp.move(*self.inp.getyx())
        self.inp.refresh()

    def validate(self, ch, state):
        if ord(ch) == 127: # Backspace
            ch = chr(curses.KEY_BACKSPACE)
        if ord(ch) == 68:
            return
        if ord(ch) == 27:
            return
        if ord(ch) == 79:
            return
        if ord(ch) == 67:
            return
        if ord(ch) == 13: # Enter
            cmd = self.tb.gather()
            self.inp.move(*self.inp.getyx())
            self.inp.clear()
            self.inp.refresh()
            if cmd and cmd[0] == '/':
                if "/rules" in cmd:
                    state['game']['chat'].insert(0, "")
                    state['game']['chat'].insert(0, "****** Game Overview ******")
                    state['game']['chat'].insert(0, "Take turns rolling both dice. Each turn,")
                    state['game']['chat'].insert(0, "choose to add or subtract the dice from your score.")
                    state['game']['chat'].insert(0, "Your goal is to get a score of either:")
                    state['game']['chat'].insert(0, "")
                    state['game']['chat'].insert(0, "    33")
                    state['game']['chat'].insert(0, "  66  67")
                    state['game']['chat'].insert(0, " 98 99 100")
                    state['game']['chat'].insert(0, "")
                    state['game']['chat'].insert(0, "Additional rules:")
                    state['game']['chat'].insert(0, "Doubles - you MUST roll again.")
                    state['game']['chat'].insert(0, "Sevens - SPLIT: add each die individually")
                    state['game']['chat'].insert(0, "Reset - Match another player's score, and their")
                    state['game']['chat'].insert(0, "score will be reset to zero.")
                    state['game']['chat'].insert(0, "")
                    self.render(state)
                elif "/restart" in cmd:
                    asyncio.async(queue.put({'type': 'restart'}))
                elif "/r" in cmd:
                    asyncio.async(queue.put({'type': 'roll'}))
                elif "/sa" in cmd:
                    asyncio.async(queue.put({'type': 'sub_nth', 'n': 0}))
                    asyncio.async(queue.put({'type': 'add_nth', 'n': 1}))
                elif "/as" in cmd:
                    asyncio.async(queue.put({'type': 'add_nth', 'n': 0}))
                    asyncio.async(queue.put({'type': 'sub_nth', 'n': 1}))
                elif "/a" in cmd:
                    if sum(state['game']['rolls']) == 7:
                        asyncio.async(queue.put({'type': 'add_nth', 'n': 0}))
                        asyncio.async(queue.put({'type': 'add_nth', 'n': 1}))
                    else:
                        asyncio.async(queue.put({'type': 'add'}))
                elif "/s" in cmd:
                    if sum(state['game']['rolls']) == 7:
                        asyncio.async(queue.put({'type': 'sub_nth', 'n': 0}))
                        asyncio.async(queue.put({'type': 'sub_nth', 'n': 1}))
                    else:
                        asyncio.async(queue.put({'type': 'sub'}))
                elif "/n" in cmd:
                    splitten = cmd.split()
                    if len(splitten) > 1:
                        name = splitten[1]
                        asyncio.async(queue.put({'type': 'update_name', 'name': name}))
                    else:
                        asyncio.async(queue.put({'type': 'update_name', 'name': ''}))
                elif "/q" in cmd:
                    sys.exit(0);
                elif "/h" in cmd:
                    state['game']['chat'].insert(0, "")
                    state['game']['chat'].insert(0, "****** Possible commands ******")
                    state['game']['chat'].insert(0, "/[r]oll - roll the dice")
                    state['game']['chat'].insert(0, "/[a]dd - add both to your score")
                    state['game']['chat'].insert(0, "/[s]ubtract - subtract both from your score")
                    state['game']['chat'].insert(0, "/as - split: add first, subtract second")
                    state['game']['chat'].insert(0, "/sa - split: subtract first, add second")
                    state['game']['chat'].insert(0, "/[q]uit - quit the game :(")
                    state['game']['chat'].insert(0, "/[n]ame - set or clear your name")
                    state['game']['chat'].insert(0, "/[h]elp - show this page")
                    state['game']['chat'].insert(0, "/restart - start a new game")
                    state['game']['chat'].insert(0, "/rules - show an overview of the game")
                    state['game']['chat'].insert(0, "/link - display the room link")
                    state['game']['chat'].insert(0, "")
                    self.render(state)
                elif "/link" in cmd:
                    state['game']['chat'].insert(0, "https://rollycubes.com/"+state['room'])
                    self.render(state)
                else:
                    state['game']['chat'].insert(0, "Unknown command. Try /help")
                    self.render(state)
            elif cmd:
                asyncio.async(queue.put({'type': 'chat', 'msg': cmd}))

        else:
            self.tb.do_command(ord(ch))
            self.inp.refresh()
        #self.tb.edit(self.validate)

def main(scr):
    room = str(binascii.b2a_hex(os.urandom(6)))
    if len(sys.argv) > 1:
        room = sys.argv[1]
    game_state = {
        'room': room,
        'self_index': 0,
        'game': {
            'chat': [],
            'players': [],
            'rolled': False,
            'rolls': [],
            'used': [],
            'victory': False,
            'turn_index': 0,
        }
    }
    ui = GameUI(scr)
    curses.init_pair(1, curses.COLOR_WHITE, curses.COLOR_BLACK)
    curses.init_pair(2, curses.COLOR_RED, curses.COLOR_BLACK)
    curses.init_pair(3, curses.COLOR_GREEN, curses.COLOR_BLACK)
    while True:
        loop = asyncio.get_event_loop()
        loop.add_reader(sys.stdin, user_input, ui, game_state)
        loop.run_until_complete((handler(SERVER_WS+game_state['room'], ui, game_state)))

curses.wrapper(main)
