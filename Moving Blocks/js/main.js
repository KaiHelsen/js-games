//moving blocks


(function ()
{

    const PLAYER_SPEED = 600; //units per second
    const PLAYER_ROTATION_SPEED = 30; //degrees per second
    const FPS = 60;
    const DELTA_TIME = 1/ FPS;

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

    let Rect = function (x = 0, y = 0, height = 0, width = 0, posX = 0, posY = 0)
    {
        this.position = new Vector(x,y);
        this.size = new Vector(height, width);
        this.center = new Vector(x + width/2, y + height/2);

        this.setPosition(posX, posY);
    }

    Rect.prototype.setPosition = function (xPos = this.center.x, yPos = this.center.y)
    {
        this.center.x = xPos;
        this.center.y = yPos;

        this.position.x = this.center.x- this.size.x/2;
        this.position.y = this.center.y- this.size.y/2;

    }

    Rect.prototype.move = function(x = 0, y=0)
    {
        this.center.x += x;
        this.center.y += y;

        this.position.x = this.center.x - this.size.x/2;
        this.position.y = this.center.y - this.size.y/2;
    }

    Rect.prototype.checkCollision = function(otherRect)
    {
        return(
            this.position.x < otherRect.position.x + otherRect.size.x &&
            this.position.x + this.size.x > otherRect.position.x &&
            this.position.y < otherRect.position.y + otherRect.size.y &&
            this.position.y + this.size.y > otherRect.position.y);
    }

    Rect.prototype.withinBounds = function(bounds = new Rect())
    {
        return (
            this.position.x > bounds.position.x &&
            this.position.y > bounds.position.y &&
            this.position.x + this.size.x < bounds.position.x + bounds.position.x &&
            this.position.y + this.size.y < bounds.position.y + bounds.position.y
        )
    }

    class block
    {
        element;    //display element
        name = "myName";        //name of this object
        collider;               //collider rect of this object
        rotation;               //stores rotation of this object

        constructor(element, name = "myName", height = 20, width = 20, posX = 0, posY = 0)
        {
            this.element = element;
            this.name = name;
            this.collider = new Rect(0,0,height, width);
            this.collider.setPosition(posX, posY);
            this.rotation = 0;

            this.draw();
        };

        /**
         *
         * @param {Vector} direction direction vector in which the block should move
         */
        move(direction)
        {
            direction.normalize();
            direction.multiply(PLAYER_SPEED * DELTA_TIME);
            this.collider.move(direction.x,direction.y);

        };

        collisionCheck(otherRect)
        {
            this.element.style.backgroundColor = "red";
            if(this.collider.checkCollision(otherRect.collider)){
                this.element.style.backgroundColor = "purple";
            }

            //clamp to window
            let xRange = window.innerWidth/2;
            let yRange = window.innerHeight/2;
            let screenCenter = new Vector(xRange, yRange);

            this.collider.center.x = Math.max(this.collider.size.x/2, Math.min(this.collider.center.x, window.innerWidth - this.collider.size.x/2));
            this.collider.center.y = Math.max(this.collider.size.y/2, Math.min(this.collider.center.y, window.innerHeight - this.collider.size.y/2));

            // if(this.collider.position.x <= 0)
            // {
            //     this.collider.center.x -=this.collider.position.x;
            // }
            // else if(this.collider.position.x + this.collider.size.x >= window.innerWidth){
            //     this.collider.center.x += window.innerWidth - this.collider.position.x - this.collider.size.x;
            // }
            //
            //
            // if(this.collider.position.y <= 0)
            // {
            //     this.collider.center.y -= this.collider.position.y;
            // }
            // else if(this.collider.position.y + this.collider.size.y >= window.innerHeight){
            //     this.collider.center.y += window.innerHeight - this.collider.position.y - this.collider.size.y;
            // }
        }

        draw()
        {

            //draw element at position
            this.element.style.left = this.collider.position.x + "px";
            this.element.style.top = this.collider.position.y + "px";

            //adjust element width and height
            // this.element.style.rotate = this.rotation + "deg";
            // this.rotation += 3 * DELTA_TIME;
            this.element.style.width = this.collider.size.y + "px";
            this.element.style.height = this.collider.size.x + "px";

        }

        forcePosition(posX, posY)
        {
            this.collider.center.x = posX;
            this.collider.center.y = posY;
        }
    }

    console.log("initializing...");
    let screenSize = {width: window.innerWidth, height: window.innerHeight};

    let playerCube = new block(document.getElementById("player"), "player", 90, 90, screenSize.width / 2, screenSize.height / 2);

    let enemyCube = new block(document.querySelector(".enemy"), "enemy", 90,90, 120, 120);

    let input = {up: false, down: false, left: false, right: false};


    console.log(DELTA_TIME);

    document.addEventListener("keydown", keyDownHandler, false);

    document.addEventListener("keyup", keyUpHandler, false);

    setInterval(tick, DELTA_TIME * 1000 );

    function tick() {
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

        playerCube.collisionCheck(enemyCube);

        playerCube.draw();
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
}());