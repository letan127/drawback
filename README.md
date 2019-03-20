# drawback
This is a copy of the original Drawback app, which is an online, collaborative whiteboard written in Angular.

## Setup
### Local
1. `git clone https://github.com/HongKTruong/drawing-jamboard.git`
2. `npm install`
3. Run `npm start`
4. Open a browser on localhost:3000
5. Draw and have fun!
### GCP
To set up the server on GCP so that others can access your URL:
1. Go to your GCP console and make sure you are on the `Drawback` project dashboard
2. Go to the Compute Engine dashboard
3. Start the instance and SSH into it
4. `git clone https://github.com/HongKTruong/drawing-jamboard.git` or `git pull`
5. `npm install` if you haven't already
6. Change the `url` variable in `draw.service.ts` to the external IP of the instance followed by the `drawing` port specified in the firewall rules `http://externalIP:port`
7. Make the server listen to the same port in `draw.ts` by modifiying `server.listen(port)`
8. Set the port in `server.ts` to the `default-allow-rdp` port specified in the firewall rules
9. `ng build`
10. `npm start`
11. Visit the url `http://externalIP:port` and start drawing!

## Features
- Colors - Can draw in black, red, orange, yellow, green, blue, and purple
- Clear - Removes all marks from the canvas
- Undo - Removes the last stroke done on the canvas
- Redo - Redoes the last undone stroke
- Eraser - Will draw white on the canvas
- Pens - Has different size pen widths

## Sources
- `W3` for its great front-end tutorials
- `AwwApp` for inspiration
