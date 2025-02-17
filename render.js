class Renderer {
    constructor(game) {
        this.game = game

        this.canvas = document.getElementById("c")
        this.ctx = this.canvas.getContext("2d")

        this.resizeCanvas()
        this.lastFPS = (new Date()).getTime()
        this.fps = 0

        this.offset = v()

        this.debug = false
        window.onresize = ()=>{this.resizeCanvas()}
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    init() {
        requestAnimationFrame(()=>{this.renderLoop(this)})
    }
    clearCanvas() {
        this.canvas.width = this.canvas.width
    }

    renderLoop(self) {
        let averageStrength = 50,
            currentFps = (new Date()).getTime()-self.lastFPS
        if(currentFps<100) self.fps = ((self.fps*averageStrength)+currentFps)/(averageStrength+1)
        
        self.clearCanvas()
        self.renderBackground()
        self.ctx.save()
        self.ctx.translate(self.offset.x,self.offset.y)

        self.renderLevel(self.game.levelHandler)
        self.renderConstraints()

        

        for (let i = 0; i < self.game.players.length; i++) {
            const player = self.game.players[i];
            self.renderPlayer(player)
        }

        self.renderEntities()
        
        if (self.debug) self.renderTriggers()
        self.ctx.restore()

        if (self.debug) self.renderDebug()

        self.lastFPS = (new Date()).getTime()
        requestAnimationFrame(()=>{self.renderLoop(self)})
    }

    renderPlayer(player) {
        this.ctx.save()
        var playerPos = player.body.position
        this.ctx.translate(playerPos.x,playerPos.y)
        this.ctx.scale(player.direction,1)
        this.ctx.scale(player.scale,player.scale)
        this.ctx.translate(-playerPos.x,-playerPos.y)
        let frame = drawSprite(this, player)
    
        this.ctx.restore()
        this.ctx.fillStyle = "#f0f"
        if (this.debug) {
            this.ctx.fillText(frame, playerPos.x+(spriteSize.x*0.5)+5,playerPos.y-(spriteSize.y*0.5))
            if (player.conn) {
                this.ctx.fillText(player.conn.clientUsername, playerPos.x,playerPos.y-(spriteSize.y*0.5)-10)
            }
            this.ctx.save()
            this.ctx.beginPath()
            let centerPos = v(player.body.position.x,player.body.position.y+(spriteSize.y*0.5))
            this.ctx.translate(centerPos.x,centerPos.y)
            this.ctx.scale(1.45,0.5)
            this.ctx.translate(-centerPos.x,-centerPos.y)
            this.ctx.arc(centerPos.x,centerPos.y,spriteSize.x*0.25,0,Math.PI*2)

            this.ctx.stroke()
            if(player.onGround()) this.ctx.fill()
            this.ctx.closePath()
            this.ctx.restore()
        }

    }
    renderConstraints() {
        for (let i = 0; i < this.game.constraints.length; i++) {
            const con = this.game.constraints[i];
            this.ctx.beginPath()
            this.ctx.moveTo(con.bodyA.body.position.x,con.bodyA.body.position.y)
            this.ctx.lineTo(con.bodyB.body.position.x,con.bodyB.body.position.y)
            this.ctx.stroke()
            this.ctx.closePath()
            
        }
    }
    renderBackground() {
        var grad = this.ctx.createLinearGradient(window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight)
        
        grad.addColorStop(1,"rgb(255,226,24)")
        grad.addColorStop(0,"rgb(255,176,23)")
        this.ctx.fillStyle = grad
        this.ctx.fillRect(0,0,window.innerWidth,window.innerHeight)
    }
    renderButtons() {
        var cellsize = this.game.levelHandler.currentLevel.cellsize

        for (let i = 0; i < this.game.buttons.length; i++) {
            const but = this.game.buttons[i];
            //console.log(but.trigger)
            if (but.trigger.playerInside) {
                this.ctx.drawImage(levelAtlas, 
                    600,535,
                    161,161,
                    (but.pos.x-0.5)*cellsize.x,(but.pos.y-0.5)*cellsize.y,cellsize.x,cellsize.y)
            } else {
                this.ctx.drawImage(levelAtlas, 
                    389,535,
                    161,161,
                    (but.pos.x-0.5)*cellsize.x,(but.pos.y-0.5)*cellsize.y,cellsize.x,cellsize.y)
                }
            
        }
    }
    renderDoors() {
        var cellsize = this.game.levelHandler.currentLevel.cellsize

        for (let i = 0; i < this.game.doors.length; i++) {
            const but = this.game.doors[i];
            //console.log(but.trigger)
            if (but.open) {
                this.ctx.drawImage(levelAtlas, 
                    591,885,
                    161*2.5,161*2.5,
                    (but.pos.x-1.5)*cellsize.x,(but.pos.y-2.5)*cellsize.y,cellsize.x*2,cellsize.y*2)
            } else {
                this.ctx.drawImage(levelAtlas, 
                    111,885,
                    161*2.5,161*2.5,
                    (but.pos.x-1.5)*cellsize.x,(but.pos.y-2.5)*cellsize.y,cellsize.x*2,cellsize.y*2)
                }
            
        }
    }
    renderTriggers() {
        for (let i = 0; i < this.game.triggers.length; i++) {
            const trig = this.game.triggers[i];
            this.ctx.strokeStyle = "#f00"
            var bounds = trig.rect.bounds,
                    size = v(-(bounds.min.x-bounds.max.x),-(bounds.min.y-bounds.max.y))
            this.ctx.strokeRect(bounds.min.x,bounds.min.y, size.x,size.y)
        }
    }
    renderLevel(levelHandler) {
        

        

        var color = "rgb(255,134,77)",
            levelData = levelHandler.currentLevel.data,
                cellsize = levelHandler.currentLevel.cellsize
    
        if (levelData!=undefined) {
            for (let x = 0; x < levelData.length; x++) {
                const row = levelData[x];
                for (let y = 0; y < row.length; y++) {
                    const cell = row[y];
                    this.ctx.fillStyle = color
                    if (cell) {
                        if (!levelData[Math.max(x-1,0)][y]) {
                            this.ctx.drawImage(
                                levelAtlas,
                                126,194,
                                161,161,
                                (y-0.5)*cellsize.x,(x-0.5)*cellsize.y,cellsize.x,cellsize.y
                            )
                        } else{
                            this.ctx.drawImage(
                                levelAtlas,
                                389,191,
                                161,161,
                                (y-0.5)*cellsize.x,(x-0.5)*cellsize.y,cellsize.x,cellsize.y
                            )
                        }
                    }
                }
            }
        }
        this.renderDoors()
        this.renderButtons()

        if(this.debug) {
            var bodies = Matter.Composite.allBodies(this.game.matter.engine.world)
            for (let i = 0; i < bodies.length; i++) {
                const bod = bodies[i];
                var bounds = bod.bounds,
                    size = v(-(bounds.min.x-bounds.max.x),-(bounds.min.y-bounds.max.y))
                this.ctx.strokeStyle = "#f0f"
                this.ctx.lineWidth = 2

                this.ctx.strokeRect(bounds.min.x,bounds.min.y,size.x,size.y)
            }
        }


    }
    renderEntities() {
        for (let i = 0; i < this.game.entities.length; i++) {
            const ent = this.game.entities[i];
            ent.render(this.ctx)
            if (ent.constructor.name=="Key"&&this.debug) {
                if (!ent.targetedDoor) {
                    this.ctx.beginPath()
                    this.ctx.arc(ent.pos.x,ent.pos.y,45,0,Math.PI*2)
                    this.ctx.strokeStyle = "#f00"
                    this.ctx.stroke()
                    this.ctx.closePath()

                    if (ent.followingPlayer) {
                        this.ctx.beginPath()

                        this.ctx.moveTo(ent.pos.x,ent.pos.y)
                        this.ctx.lineTo(ent.followingPlayer.body.position.x,ent.followingPlayer.body.position.y)
                        this.ctx.strokeStyle = "#00f"
                        this.ctx.stroke()
                        this.ctx.closePath()

                    }
                }
                
            }
        }
    }
    renderDebug() {
        var strings = [
            "v69.420",
            "pico park clone | aeolus-1 on github",
                (new Date()),
                "break",
            ...((window.clientConnection)?([
                "--client connection--",

            `server connection: ${window.navigator.onLine}`,
            `fully connected: ${clientConnection.mainConn.fullyConnected}`,
            `ping: ${Math.floor(clientConnection.mainConn.lastPing*10)/10}ms`,
            ]):(window.hostConnection)?([
                "--host connection--",
                `connections: ${hostConnection.connections.length}`,
                ...(
                    function(){
                        var connections = hostConnection.connections,
                            mapConn = new Array(connections.length),
                                returnArray = []

                        for (let i = 0; i < mapConn.length; i++) {
                            const mA = mapConn[i];
                            returnArray = [...returnArray,
                                "step",
                                `username: ${connections[i].clientUsername}`,
                                `color: ${connections[i].clientBody.color}`,
                                `id: ${connections[i].clientBody.body.id}`,
                                `ping: ${Math.floor(connections[i].lastPing*10)/10}ms`,
                                `S2T connected: ${connections[i].connS2T.peer._open}; T2S connected: ${connections[i].connT2S.peer._open}`
                            ]
                                
                            
                        }

                        return [...returnArray,]
                    }
                )(),
            ]):([
                "not multiplayer game",
                "step",
                "warm sandy beaches and ",
                "cocktails with the little straw hats",
            ])
            ),
            "break",
            "--matter--",
            `FPS: ${Math.floor(10000/mainGame.renderer.fps)/10}`,
            `bodies: ${Matter.Composite.allBodies(mainGame.matter.engine.world).length}`,
            "break",
            
        ],
            fontsize = 15,
            step = 0

        for (let i = 0; i < strings.length; i++) {
            const str = strings[i];
            if (str=="break") {
                step += fontsize*1
            } else if(str=="step"){
                step += fontsize*0.3
            } else {
                step += fontsize
                ;this.drawDebugText(v(0,step),str, fontsize)}
        }
        
    }
    drawDebugText(pos, string, fontsize) {
        this.ctx.fillStyle = "#000a"
        this.ctx.font = `${fontsize}px Times New Roman`
        var measure = this.ctx.measureText(string)
        

        this.ctx.fillRect(pos.x,pos.y+2,measure.width,(-fontsize))
        this.ctx.fillStyle = "#fff"

        this.ctx.fillText(string, pos.x, pos.y)
    }
    
    
}

function renderCheckLoop() {
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        player.updatePlayerParts()


    }
}

