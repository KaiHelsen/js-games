//moving blocks


(function ()
{
    //define constant values for gameplay
    const PLAYER_SPEED = 1200; //units per second
    const PLAYER_ROTATION_SPEED = 30; //degrees per second
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
     * @param {Vector} otherVector
     */
    Vector.prototype.add = function (otherVector)
    {
        this.x += otherVector.x;
        this.y += otherVector.y;
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

    Vector.prototype.invert = function ()
    {
        this.x *= -1;
        this.y *= -1;
    }

    //rect and rect functions
    let Rect = function (x = 0, y = 0, height = 0, width = 0, posX = 0, posY = 0)
    {
        this.position = new Vector(x, y);
        this.size = new Vector(height, width);
        this.center = new Vector(x + width / 2, y + height / 2);

        this.setPosition(posX, posY);
    }

    Rect.prototype.setPosition = function (xPos = this.center.x, yPos = this.center.y)
    {
        this.center.x = xPos;
        this.center.y = yPos;

        this.position.x = this.center.x - this.size.x / 2;
        this.position.y = this.center.y - this.size.y / 2;

    }

    Rect.prototype.move = function (x = 0, y = 0)
    {
        this.center.x += x;
        this.center.y += y;

        this.position.x = this.center.x - this.size.x / 2;
        this.position.y = this.center.y - this.size.y / 2;
    }

    Rect.prototype.checkCollision = function (otherRect)
    {
        return (
            this.position.x < otherRect.position.x + otherRect.size.x &&
            this.position.x + this.size.x > otherRect.position.x &&
            this.position.y < otherRect.position.y + otherRect.size.y &&
            this.position.y + this.size.y > otherRect.position.y);
    }

    Rect.prototype.withinBounds = function (bounds = new Rect())
    {
        return (
            this.position.x > bounds.position.x &&
            this.position.y > bounds.position.y &&
            this.position.x + this.size.x < bounds.position.x + bounds.position.x &&
            this.position.y + this.size.y < bounds.position.y + bounds.position.y
        )
    }

    //block class
    class Block
    {
        momentum = new Vector(0, 0);
        element;                //display element
        name = "myName";        //name of this object
        collider;               //collider rect of this object
        rotation;               //stores rotation of this object
        acceleration = 60;
        deceleration = 8;
        isActive = true;

        constructor(element, name = "myName", height = 20, width = 20, posX = 0, posY = 0) {
            this.element = element;
            this.name = name;
            this.collider = new Rect(0, 0, height, width);
            this.collider.setPosition(posX, posY);
            this.rotation = 0;

            this.draw();
        };

        /**
         *
         * @param {Vector} direction direction vector in which the block should move
         */
        move(direction) {
            if (direction.magnitude() > 0 && direction) {
                direction.normalize();
                // direction.multiply(PLAYER_SPEED * DELTA_TIME);
                direction.multiply(this.acceleration * DELTA_TIME);

                // console.log(direction);
                this.momentum.add(direction);
                this.momentum.clamp(PLAYER_SPEED * DELTA_TIME);

            }
            else
                if(this.momentum.magnitude() >= this.deceleration * DELTA_TIME * .2)
            {
                let deceleration = new Vector(this.momentum.x, this.momentum.y);
                deceleration.normalize();

                deceleration.invert();
                deceleration.multiply(this.deceleration * DELTA_TIME);

                // console.log(deceleration)
                this.momentum.add(deceleration);

            }
            else {
                this.momentum.multiply(0);
            }


            this.collider.move(this.momentum.x, this.momentum.y);
        }

        collisionCheck(otherRect) {
            if (this.collider.checkCollision(otherRect)) {
                return true;
            }
            else {
                return false;
            }
        }

        forceGameBounds() {
            //clamp to window
            let xRange = window.innerWidth / 2;
            let yRange = window.innerHeight / 2;
            let screenCenter = new Vector(xRange, yRange);

            //clamp within bounds
            this.collider.center.x = Math.max(this.collider.size.x / 2, Math.min(this.collider.center.x, window.innerWidth - this.collider.size.x / 2));
            this.collider.center.y = Math.max(this.collider.size.y / 2, Math.min(this.collider.center.y, window.innerHeight - this.collider.size.y / 2));

            if(this.collider.position.x <= 0 || this.collider.position.x + this.collider.size.x >= window.innerWidth)
            {
                this.momentum.x = this.momentum.x * -.3;
            }
            if(this.collider.position.y <= 0 || this.collider.position.y + this.collider.size.y >= window.innerHeight)
            {
                this.momentum.y = this.momentum.y * -.3;
            }


            //limit momentum
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

        }

        forcePosition(posX, posY) {
            this.collider.center.x = posX;
            this.collider.center.y = posY;
        }

        deSpawn() {
            this.element.style.visibility = "hidden";
            this.element.isMoving = false;
            this.isActive = false;
            this.forcePosition(0, 0);
        }
    }

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

            let newTargetX = Math.random() * (window.innerWidth - padding.x) + padding.x / 2 | 0;
            let newTargetY = Math.random() * (window.innerHeight - padding.y) + padding.y / 2 | 0;

            this.setTargetPosition(newTargetX, newTargetY);

            // console.log("new target position: " + this.targetPosition.x, this.targetPosition.y);
        }

        spawn(posX = 0, posY = 0) {
            this.element.isMoving = true;
            this.isActive = true;
            this.forcePosition(posX, posY);
            this.pickDestination();

            setTimeout(() => {this.element.style.visibility = "visible"}, .1 * 1000);
        };

    }

    class EnemySpawner
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
            enemy.element.style.visibility = "hidden";
        }

        spawnEnemy() {
            let enemy = this.enemiesList.find(element => !element.isActive);

            if (enemy != null && this.enemiesList.filter(element => element.isActive).length < this.maxEnemies) {
                //pick random location outside of window to spawn enemy
                //let's be lazy and just have them move in from the top of the screen for now

                let posX = Math.random() * window.innerWidth;
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

    class GameManager
    {
        constructor(playerLives, livesDisplay, scoreDisplay, gameplayDisplay, gameOverDisplay) {
            this.lives = playerLives;
            this.livesDsp = livesDisplay;
            this.scoreDsp = scoreDisplay;
            this.gameDsp = gameplayDisplay
            this.gameOverDsp = gameOverDisplay
            this.timer = 0;
        };

        startGame(onStartFunction = new Function()) {
            this.gameDsp.style.visibility = "visible";
            this.gameOverDsp.style.visibility = "hidden";
            onStartFunction();
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
    }

    console.log("initializing...");
    let screenSize = {width: window.innerWidth, height: window.innerHeight};

    let game = new GameManager(
        MAX_LIVES,
        document.getElementById("livesDsp"),
        document.getElementById("scoreDsp"),
        document.getElementById("playingField"),
        document.getElementById("gameOverScreen")
    );

    let playerCube = new Block(document.getElementById("player"), "player", 80, 80, screenSize.width / 2, screenSize.height / 2);

    let spawner = new EnemySpawner(MAX_ENEMIES, 3, 3, 6);

    // let enemyCube = new EnemyBlock(document.getElementById("enemy_01"), "enemy", 90, 90, 120, 120, 300);

    let enemyCubeTemplate = document.getElementById("enemyTemplate").content.cloneNode(true);

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

    //spawn first enemy for testing purposes
    // spawner.spawnEnemy();


    let input = {up: false, down: false, left: false, right: false};

    document.addEventListener("keydown", keyDownHandler, false);

    document.addEventListener("keyup", keyUpHandler, false);

    let gameTimer = setInterval(tick, DELTA_TIME * 1000);

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