//moving blocks


(function ()
{
    //define constant values for gameplay
    const PLAYER_SPEED = 1200; //units per second
    const FPS = 60;
    const DELTA_TIME = 1 / FPS;
    const MAX_LIVES = 3;
    const MAX_ENEMIES = 20;

    //vector and vector functions
    let Vector = function (x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }

    /**
     * normalize vector
     *
     * sets vector length to 1
     */
    Vector.prototype.normalize = function ()
    {
        if (this.x === 0 && this.y === 0) {
            return;
        }
        let length = Math.sqrt(this.x * this.x + this.y * this.y);
        this.x = this.x / length;
        this.y = this.y / length;
    }

    /**
     *
     * @param Vector1
     * @param Vector2
     * @returns {Vector}
     */
    Vector.add = function (Vector1, Vector2)
    {
        return new Vector(Vector1.x + Vector2.x, Vector1.y + Vector2.y);
    }

    Vector.subtract = function(Vector1, Vector2)
    {
        return new Vector(Vector1.x - Vector2.x, Vector1.y - Vector2.y);
    }

    /**
     * returns length of the vector
     * @returns {number}
     */
    Vector.prototype.magnitude = function ()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * multiply vector by value
     * @param value
     */
    Vector.prototype.multiply = function (value = 1)
    {
        this.x *= value;
        this.y *= value;
    }

    /**
     * clamp maximum magnitude of this vector to value
     * @param value
     */
    Vector.prototype.clamp = function (value = 1)
    {
        let newMagnitude = Math.min(this.magnitude(), value);
        this.normalize()
        this.multiply(newMagnitude);
    }

    /**
     * invert Vector direction
     */
    Vector.prototype.invert = function ()
    {
        this.x *= -1;
        this.y *= -1;
    }

    //rect and rect functions
    /**
     * Rect functions handle and support rectangular shapes and collision checks between them
     * @param {number} x x coordinate of the top left corner of the rect
     * @param {number} y y coordinate of the top left corner of the rect
     * @param {number} height height of the rect
     * @param {number} width width of the rect
     * @param {number} posX optional, x position in world space of the rect. the rects center point is placed at this position.
     * @param {number} posY optional, y position in world space of the rect. the rects center point is placed at this position.
     * @constructor
     */
    let Rect = function (x = 0, y = 0, height = 0, width = 0, posX = 0, posY = 0)
    {
        this.position = new Vector(x, y);
        this.size = new Vector(height, width);
        this.center = new Vector(x + width / 2, y + height / 2);

        this.setPosition(posX, posY);
    }

    /**
     * set position of the rect. the position is placed according to its center point, rather than its top left corner
     * @param xPos
     * @param yPos
     */
    Rect.prototype.setPosition = function (xPos = this.center.x, yPos = this.center.y)
    {
        this.center.x = xPos;
        this.center.y = yPos;

        this.position.x = this.center.x - this.size.x / 2;
        this.position.y = this.center.y - this.size.y / 2;

    }

    /**
     * adds input coordinates to rects current coordinates.
     * @param x
     * @param y
     */
    Rect.prototype.move = function (x = 0, y = 0)
    {
        this.center.x += x;
        this.center.y += y;

        this.position.x = this.center.x - this.size.x / 2;
        this.position.y = this.center.y - this.size.y / 2;
    }

    /**
     * Returns true if this rect and the input rect overlap.
     * TODO: make a function to calculate overlap and return as a vector to allow for adjustment?
     * @param otherRect
     * @returns {boolean}
     */
    Rect.prototype.checkCollisionRect = function (otherRect)
    {
        return (
            this.position.x < otherRect.position.x + otherRect.size.x &&
            this.position.x + this.size.x > otherRect.position.x &&
            this.position.y < otherRect.position.y + otherRect.size.y &&
            this.position.y + this.size.y > otherRect.position.y);
    }

    let Circle = function(x = 0, y = 0, radius = 0, posX = 0, posY = 0)
    {
        this.position = new Vector(x,y);
        this.radius = radius;
        this.diameter = radius * 2;
        this.center = new Vector(x + radius, y + radius);
    }

    Circle.prototype.setPosition = function(xPos = this.center.x, yPos = this.center.y)
    {
        this.center.x = xPos;
        this.center.y = yPos;

        this.position.x = this.center.x - this.radius;
        this.position.y = this.center.y - this.radius;
    }

    /**
     * returns true if this rect is within the bounds of the input rect
     * TODO: make a function to calculate overlap and return as a vector to allow for adjustment?
     * @param bounds
     * @returns {boolean}
     */
    Rect.prototype.withinBounds = function (bounds = new Rect())
    {
        return (
            this.position.x > bounds.position.x &&
            this.position.y > bounds.position.y &&
            this.position.x + this.size.x < bounds.position.x + bounds.position.x &&
            this.position.y + this.size.y < bounds.position.y + bounds.position.y
        )
    }

    /**
     * block class is a basic class to handle the moving blocks in the game. every block requires an element to properly display in the viewport
     */
    class Block
    {
        element;                //display element
        name = "myName";        //name of this object
        collider;               //collider rect of this object
        rotation;               //stores rotation of this object
        isActive = true;        //whether or not this element is "active" within the world/game and should be accounted for

        /**
         * The block class is the basic element that handles in-game block elements. player, enemies, obstacles, etc.
         * @param {HTMLElement} element HTML element that is displayed in-game.
         * @param {string} name name of this element
         * @param {number} height height of this element's rect
         * @param {number} width width of this element's rect
         * @param {number} posX X position of the element's center point.
         * @param {number} posY Y position of the elmeent's center point.
         */
        constructor(element, name = "myName", height = 20, width = 20, posX = 0, posY = 0) {
            this.element = element;
            this.name = name;
            this.collider = new Rect(0, 0, height, width);
            this.collider.setPosition(posX, posY);
            this.rotation = 0;

            this.draw();
        };

        collisionCheck(otherRect) {
            return this.collider.checkCollisionRect(otherRect);
        }

        update(){
            this.draw();
        }

        draw() {

            //draw element at position
            this.element.style.left = this.collider.position.x + "px";
            this.element.style.top = this.collider.position.y + "px";

            //adjust element width and height
            // this.element.style.rotate = this.rotation + "deg";
            // this.rotation += 3 * DELTA_TIME;
            this.element.style.width = this.collider.size.y + "px";
            this.element.style.height = this.collider.size.x + "px";

            if(!this.isActive){this.element.style.visibility = "hidden"}
            else{this.element.style.visibility = "visible"}

        }

        forcePosition(posX, posY) {
            this.collider.center.x = posX;
            this.collider.center.y = posY;
        }
    }

    /**
     * Player Controller is an extension of the block class that handles methods specific to the player.
     * because of the way it moves, it has an internal simplified physics system
     */
    class PlayerController extends Block
    {
        momentum = new Vector(0, 0); //current momentum of the player controller
        maxSpeed = 0; //maximum speed this object can reach
        acceleration = 0; //rate at which this object accelerates. ie. this is the amount by which the speed increases per second
        drag = 0; //slows down object movement gently


        constructor(element, name, height, width, posX, posY, maxSpeed, acceleration, drag) {
            super(element, name, height, width, posX, posY);
            this.maxSpeed = maxSpeed;
            this.acceleration = acceleration;
            this.drag = drag;
        }

        update(){
            move(inputVector)

            this.draw()
        }
        /**
         * Based on input direction vector, this function moves the Player Controller based on simple physics
         * first, evaluate whether there is any input at all. If there is, the object is accelerated in the direction of the input
         * second, if the momentum of the object is above a minimum threshold, drag is added to the momentum, ensuring the controller slows down.
         * last, if the momentum of the object is BELOW the minimum threshold, the momentum is set to zero.
         * finally, the collider is moved based on the resulting momentum.
         * @param {Vector} direction direction vector in which forces are being applied to the Player Controller
         */
        move(direction) {
            if (direction.magnitude() > 0 && direction){
                direction.normalize();

                direction.multiply(this.acceleration * DELTA_TIME);

                this.momentum = Vector.add(this.momentum, direction);
            }

            if(Math.abs(this.momentum.x) >= this.drag * DELTA_TIME || Math.abs(this.momentum.y) >= this.drag * DELTA_TIME)
            {
                //add friction deceleration if object is NOT at rest.
                let velocity = this.momentum.magnitude();
                let friction = new Vector(this.momentum.x, this.momentum.y);
                friction.normalize();
                friction.multiply(-1 * this.drag * velocity * DELTA_TIME);

                this.momentum = Vector.add(this.momentum, friction);
            }
            else{
                this.momentum.multiply(0);
            }

            this.collider.move(this.momentum.x, this.momentum.y);
        }

        /**
         * forces Player controller to stay within the bounds of the playable space
         * If the Player controller hits the border with a certain momentum, they will bounce back.
         * Additionally, the position of the Player Controller will also be clamped inside the bounds of the screen to ensure they cannot leave at all.
         */
        forceGameBounds() {

            //clamp within bounds
            this.collider.center.x = Math.max(this.collider.size.x / 2, Math.min(this.collider.center.x, screen.x - this.collider.size.x / 2));
            this.collider.center.y = Math.max(this.collider.size.y / 2, Math.min(this.collider.center.y, screen.y - this.collider.size.y / 2));

            if (this.collider.position.x <= 0 || this.collider.position.x + this.collider.size.x >= screen.x) {
                this.momentum.x = this.momentum.x * -.3;
            }
            if (this.collider.position.y <= 0 || this.collider.position.y + this.collider.size.y >= screen.y) {
                this.momentum.y = this.momentum.y * -.3;
            }


            //limit momentum
        }

    }

    /**
     * Enemy Block is an extension of the block class that handles methods specific to the standard enemy.
     */
    class EnemyBlock extends Block
    {
        maxSpeed = 0; //maximum speed at which this unit moves;
        speed = 0;
        acceleration = 100;
        targetPosition = new Vector(0, 0);  //target position of this unit
        isMoving = false;   //whether this unit is moving towards its target position or not. is false if it has no target position, or if it has reached its target position.
        isActive = false;

        constructor(element, name = "enemyName", height = 20, width = 20, posX = 0, posY = 0, speed = 600) {
            super(element, name, height, width, posX, posY);
            this.maxSpeed = speed;

            this.pickDestination();
        }

        setTargetPosition(posX, posY) {
            this.targetPosition.x = posX;
            this.targetPosition.y = posY;
            this.isMoving = true;
        }

        moveToTarget() {
            //create a vector which determines which way the box should move
            //easy enough, subtract the target position from the current position, store in vector
            //normalize, multiply by speed * DELTA_TIME and transform
            if (this.collider.center === this.targetPosition) {
                // console.log("already at position! try again!");
                return;
            }

            // console.log("moving...");
            let direction = new Vector(0, 0);

            //create directional vector to target position
            direction.x = this.targetPosition.x - this.collider.center.x;
            direction.y = this.targetPosition.y - this.collider.center.y;

            //if distance to target is less than or equal to the deceleration distance
            if (direction.magnitude() <= 2 * ((this.speed * this.speed) / this.acceleration)) {
                this.speed = Math.max(0, this.speed - this.acceleration * DELTA_TIME);
            }
            //else, try to accelerate
            else {
                this.speed = Math.min(this.speed + this.acceleration * DELTA_TIME, this.maxSpeed);
            }

            if (direction.magnitude() <= 3) {
                this.isMoving = false;
                // console.log(this.name + " has reached its destination!");
            }
            else {
                direction.normalize();
                direction.multiply(this.speed * DELTA_TIME);

                this.collider.move(direction.x, direction.y);
            }
        }

        pickDestination() {
            let padding = new Vector(this.collider.size.x, this.collider.size.y);

            let newTargetX = Math.random() * (screen.x - padding.x) + padding.x / 2 | 0;
            let newTargetY = Math.random() * (screen.y - padding.y) + padding.y / 2 | 0;

            this.setTargetPosition(newTargetX, newTargetY);

            // console.log("new target position: " + this.targetPosition.x, this.targetPosition.y);
        }

        spawn(posX = 0, posY = 0) {
            this.element.isMoving = true;
            this.forcePosition(posX, posY);
            this.pickDestination();

            setTimeout(() => {this.isActive = true}, .1 * 1000);
        };

        deSpawn() {
            this.element.isMoving = false;
            this.isActive = false;
            this.forcePosition(0, 0);
        }

    }

    /**
     * Control Point defines and handles the control point element
     * The control point grants the player points as long as the center of their block is within the radius of the control point
     * The control point should be spawned at progressively smaller sizes, and closer to the center at regular intervals
     * This will motivate the player to move around and not just sit around in a corner, waiting.
     */
    class ControlPoint extends Block
    {
        radius = 0

        constructor(element, name = "myName", radius = 0, posX = 0, posY = 0)
        {
            super(element, name, radius * 2, radius * 2, posX, posY);
            this.radius = radius;
            this.isActive = false;

            this.draw();
        }
    }
    /**
     * Enemy Manager is built to handle enemies easily. It's functions include (but are not limited to):
     * -spawning new enemies
     * -despawning enemies when they hit the player or are otherwise "killed"
     * -re-spawning enemies that have been despawned or killed
     * -keeping track of enemies
     * -checking collision of ALL enemies with another rect or block
     * -limiting the amount of enemies in the game if appropriate
     */
    class EnemyManager
    {
        constructor(maxEnemiesInPlay, initialDelay, spawnDelayMin, spawnDelayMax) {
            this.enemiesList = [];
            this.maxEnemies = maxEnemiesInPlay;
            this.initialDelay = initialDelay;
            this.delayMin = spawnDelayMin;
            this.delayMax = spawnDelayMax;
        }

        addEnemyToList(newEnemy = new EnemyBlock(), isActive = false) {
            this.enemiesList.push(newEnemy);
            let enemy = this.enemiesList[this.enemiesList.length - 1];
            enemy.isActive = isActive;
        }

        spawnEnemy() {
            let enemy = this.enemiesList.find(element => !element.isActive);

            if (enemy != null && this.enemiesList.filter(element => element.isActive).length < this.maxEnemies) {
                //pick random location outside of window to spawn enemy
                //let's be lazy and just have them move in from the top of the screen for now

                let posX = Math.random() * screen.x;
                let posY = Math.random() * -200;

                // console.log("Spawning new enemy!: " + enemy.name + " at X: " + posX + " Y: " + posY);

                enemy.spawn(posX, posY);
            }
            else {
                console.error("cannot spawn enemy!");
            }
        }

        /**
         * this function tells the spawner that it can start doing its job
         * first thing to do, set the initial timer
         * then, set up timers to spawn extra enemies as time goes on
         */
        start() {
            let spawnDelay = this.initialDelay;
            setTimeout(() => {this.spawnEnemy()}, spawnDelay * 1000);

            for (let i = 0; i < this.enemiesList.length - 1; i++) {
                let delay = Math.random() * (this.delayMax - this.delayMin) + this.delayMin;
                spawnDelay += delay;
                setTimeout(() => {this.spawnEnemy()}, spawnDelay * 1000);
            }
        }

        kill(enemyIndex = -1) {
            //remove enemy from play
            this.enemiesList[enemyIndex].deSpawn();
            //set timer to spawn enemy again

            setTimeout(() => this.spawnEnemy(), 10 * 1000);
        }

    }

    /**
     * Game Manager oversees all other functions and handles the "gameplay systems" as it were.
     * Game manager handles score, the general timer of the game, and keeps track of the game state.
     * TODO: build in scheduling system, that allows the user to schedule certain events
     *  -ie. spawning a certain rect at a specific point in time
     */
    class GameManager
    {
        constructor(playerLives, livesDisplay, scoreDisplay, gameplayDisplay, gameOverDisplay) {
            this.lives = playerLives;
            this.livesDsp = livesDisplay;
            this.scoreDsp = scoreDisplay;
            this.gameDsp = gameplayDisplay
            this.gameOverDsp = gameOverDisplay
            this.timer = 0;

            this.score = 0;

            this.scheduler = [];
        };

        startGame(onStart = new Function()) {
            this.gameDsp.style.visibility = "visible";
            this.gameOverDsp.style.visibility = "hidden";
            onStart();
        }

        endGame() {
            // this.gameDsp.style.visibility = "hidden";
            gameOver();
            this.gameOverDsp.style.visibility = "visible";
            console.log("Game over!");
        }

        tick(callback = new Function()) {
            this.timer += DELTA_TIME;
            this.updateScore();
            callback();
            //update Score display
        }

        updateScore() {
            this.scoreDsp.innerText = this.timer | 0;
        }

        loseLife() {
            this.lives--;
            this.livesDsp.innerText = this.lives.toString();
            if (this.lives <= 0) {
                this.endGame();
            }
        }

        schedule(callbackFunction, delay, repeats){

        };
    }

    console.log("initializing...");
    let screen = new Vector(window.innerWidth,window.innerHeight);

    let game = new GameManager(
        MAX_LIVES,
        document.getElementById("livesDsp"),
        document.getElementById("scoreDsp"),
        document.getElementById("playingField"),
        document.getElementById("gameOverScreen")
    );

    let playerCube = new PlayerController(
        document.getElementById("player"),
        "player",
        80,
        80,
        screen.x / 2,
        screen.y / 2,
        PLAYER_SPEED,
        60,
        1.2);

    //initialize classes
    let spawner = new EnemyManager(MAX_ENEMIES, 3, 3, 6);

    let enemyCubeTemplate = document.getElementById("enemyTemplate").content.cloneNode(true);

    let controlPointTemplate = document.getElementById("controlPointTemplate").content.cloneNode(true);

    let controlPoint = new ControlPoint(document.querySelector(".controlPoint"), "Control Point", 400, screen.x/2, screen.y/2);

    for (let i = 0; i < MAX_ENEMIES; i++) {
        //create a series of enemies
        //first, generate a new element for the enemy to use
        let newEnemyNode = enemyCubeTemplate.cloneNode(true);
        let newEnemy = newEnemyNode.querySelector("div");
        let newId = "enemy_" + (i + 1);
        let newName = "enemy " + (i + 1);
        newEnemy.id = newId;
        newEnemy.querySelector(".textContent").innerText = "GO AWAY!!!";

        document.getElementById("wrapper").appendChild(newEnemyNode);

        spawner.addEnemyToList(new EnemyBlock(document.getElementById(newId), newName, 60 + i * 5, 60 + i * 5, 120, 120, 300), false);
    }


    //initialize input management
    let input = {up: false, down: false, left: false, right: false};

    document.addEventListener("keydown", keyDownHandler, false);

    document.addEventListener("keyup", keyUpHandler, false);

    document.addEventListener("resize",()=>{
        screen.x = window.innerWidth;
        screen.y = window.innerHeight;
    }, false);

    //initialize gameTimer
    let gameTimer = setInterval(tick, DELTA_TIME * 1000);


    //START GAME
    game.startGame();
    spawner.start();

    function tick() {
        game.tick();
        //player movement system
        let inputVector = new Vector(0, 0);
        if (input.up) {
            inputVector.y--;
        }
        if (input.down) {
            inputVector.y++;
        }
        if (input.left) {
            inputVector.x--;
        }
        if (input.right) {
            inputVector.x++;
        }

        playerCube.move(inputVector);
        playerCube.forceGameBounds();

        playerCube.draw();

        let loopIndex = 0;
        for (let enemy of spawner.enemiesList) {
            if (enemy.isActive) {
                if (!enemy.isMoving) {
                    enemy.pickDestination();
                }
                else {
                    enemy.moveToTarget();

                }
                enemy.draw();
                if (playerCube.collisionCheck(enemy.collider)) {
                    game.loseLife();
                    spawner.kill(loopIndex);
                }
            }
            loopIndex++;
        }
    }

    function keyDownHandler(event) {
        switch (event.key) {
            case("ArrowDown"):
                // case("KeyS"):
                input.down = true;
                break;
            case("ArrowUp"):
                // case("KeyW"):
                input.up = true;
                break;
            case("ArrowRight"):
                // case("KeyD"):
                input.right = true;
                break;
            case("ArrowLeft"):
                // case("KeyA"):
                input.left = true;
                break;
        }
    }

    function keyUpHandler(event) {
        switch (event.key) {
            case("ArrowDown"):
                input.down = false;
                break;
            case("ArrowUp"):
                input.up = false;
                break;
            case("ArrowRight"):
                input.right = false;
                break;
            case("ArrowLeft"):
                input.left = false;
                break;
        }
    }

    function gameOver() {
        clearInterval(gameTimer);
    }
}());