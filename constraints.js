class ConstraintHandler {
    constructor(game) {
        this.game = game
    }
    updateConstraints() {
        for (let i = 0; i < this.game.constraints.length; i++) {
            const c = this.game.constraints[i];
            this.updateConstraint(c)
        }
    }
    updateConstraint(c) {
        var bodyA = c.bodyA.body,
            bodyB = c.bodyB.body

        var dst = getDst(bodyA.position,bodyB.position),
            forceStrength = Math.min(Math.max(Math.pow(dst/100,2),0),Infinity)*0.1,
            angle = (-getAngle(bodyA.position,bodyB.position))-(90*(Math.PI/180))

        var forceVector = v(
            forceStrength*Math.cos(angle),
            forceStrength*Math.sin(angle),
        )
        
        if (1) Matter.Body.setPosition(bodyA, v(
            bodyA.position.x+(forceVector.x*10),
            bodyA.position.y,
        ))
        if (1) Matter.Body.setVelocity(bodyA, v(
            bodyA.velocity.x,
            bodyA.velocity.y+(forceVector.y),
        ))

    }
    addConstraint(options) {
        var con = new Constraint(options)

        this.game.constraints.push(con)
        return con
    }
}
class Constraint {
    constructor(options) {
        options = {
            bodyA:undefined,
            bodyB:undefined,
            ...options,
        }

        this.bodyA = options.bodyA
        this.bodyB = options.bodyB
        
    }
}