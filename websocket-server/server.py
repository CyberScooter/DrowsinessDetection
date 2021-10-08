import asyncio
import websockets
# from threading import Timer
# from ai.webcam_detection import retrieve_frame


# def frame_handler():
#     return retrieve_frame()


async def ran(websocket):
    await asyncio.sleep(3)
    await websocket.send("test")


async def server(websocket, path):
    async for message in websocket:
        if(type(message) is dict):
            print(message.__dict__)
            
        if(hasattr(message, 'frame')):
            print(getattr(message, 'frame'))
        # await websocket.send(message)


start_server = websockets.serve(server, "localhost", 3001)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
