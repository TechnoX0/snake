const rand = n => Math.floor(Math.random() * n);
const BOARD = document.getElementById("board")
const CTX = BOARD.getContext("2d")

class square {
    constructor(x, y, dir) {
        this.x = x
        this.y = y
        this.dir = dir
    }
}

// Sprite config
const SPRITE = new Image()
SPRITE.src = "./SnakeSprite2.png"
const SPRITE_WIDTH = 320;
const SPRITE_HEIGHT = 256;
const SPRITE_COLS = 5;
const SPRITE_ROWS = 4;
const COL = SPRITE_WIDTH / SPRITE_COLS
const ROW = SPRITE_HEIGHT / SPRITE_ROWS

// ! Experimental
const SPRITE_COMPONENTS = {
    head: {
        "up" : [COL * 3, ROW * 0],
        "left" : [COL * 3, ROW * 1],
        "down" : [COL * 4, ROW * 1],
        "right" : [COL * 4, ROW * 0],
    },
    body: {
        "horizontal" : [COL * 1, ROW * 0],
        "vertical" : [COL * 2, ROW * 1],

        "rightup" : [COL * 2, ROW * 2],
        "rightdown" : [COL * 2, ROW * 0],
        "leftup" : [COL * 0, ROW * 1],
        "leftdown" : [COL * 0, ROW * 0],
        "upright" : [COL * 0, ROW * 0],
        "upleft" : [COL * 2, ROW * 0],
        "downright" : [COL * 0, ROW * 1],
        "downleft" : [COL * 2, ROW * 2],
    },
    tail: {
        "up" : [COL * 3, ROW * 2],
        "left" : [COL * 3, ROW * 3],
        "down" : [COL * 4, ROW * 3],
        "right" : [COL * 4, ROW * 2],
    },
    apple: {
        "apple" : [COL * 0, ROW * 3]
    }
}
// ! ===========

// Constants
const SNAKE_SIZE = 60;
const CANVA_WIDTH = SNAKE_SIZE * 16; // ! Width and Height should be divisible by 2
const CANVA_HEIGHT = SNAKE_SIZE * 10;
const FOOD_COUNT = 2;

// Set board size
BOARD.width = CANVA_WIDTH
BOARD.height = CANVA_HEIGHT

let pause, gameOver, snakeLength, segments, nextMove, foods, velocityX, velocityY, speed, score, win, direction;
function defaultValues() {
    pause = false
    gameOver = false
    win = false

    snakeLength = 1;
    segments = [];
    nextMove = [];
    foods = [];
    velocityX = 0;
    velocityY = 0;
    speed = 250;
    score = 0;
    direction = "right";
}
defaultValues()

// Changer the snake velocity/direction
function movement() {
    if(nextMove.length) {
        switch(nextMove[0]) {
            case "w":
                velocityX = 0;
                velocityY = -SNAKE_SIZE;
                direction = "up"
                break
            case "a":
                velocityX = -SNAKE_SIZE;
                velocityY = 0;
                direction = "left"
                break
            case "s":
                velocityX = 0;
                velocityY = SNAKE_SIZE;
                direction = "down"
                break
            case "d":
                velocityX = SNAKE_SIZE;
                velocityY = 0;
                direction = "right"
                break
            default:
                console.log(nextMove[0]);
                break
        }
        nextMove.shift()
    }

    for(let seg = segments.length - 1; seg >= 0; seg--) {
        if(seg == 0) {
            segments[seg].x += velocityX
            segments[seg].y += velocityY
            segments[seg].dir = direction;
        } else {
            segments[seg].x = segments[seg-1].x
            segments[seg].y = segments[seg-1].y
            segments[seg].dir = segments[seg-1].dir
        }
    }
}

// Spawn foods at random locations
function spawnFood() {
    let foodOverlap = false
    let posX, posY
    
    // * Creates new foods object into the array
    for(let f = foods.length; f < FOOD_COUNT; f++) {
        posX = rand(CANVA_WIDTH / SNAKE_SIZE) * SNAKE_SIZE
        posY = rand(CANVA_HEIGHT / SNAKE_SIZE) * SNAKE_SIZE
        foods.push(new square(posX, posY))
    }

    do {
        foods.forEach((food, fIndex) => {
            segments.forEach((segment, sIndex) => {
                if(food.x == segment.x && food.y == segment.y && sIndex) {
                    foodOverlap = true;
                    foods.splice(fIndex, 1)
                    posX = rand(CANVA_WIDTH / SNAKE_SIZE) * SNAKE_SIZE
                    posY = rand(CANVA_HEIGHT / SNAKE_SIZE) * SNAKE_SIZE
                    foods.push(new square(posX, posY))
                } else {
                    foodOverlap = false
                }
            })
            // TODO: add a check if food overlaps each other
            
        })
    } while (foodOverlap);
}

function checks() {
    // Check for win
    segments.length >= (CANVA_HEIGHT / CANVA_WIDTH) * 100 ? win = true : win = false

    // Check if snake hit the border or ate its tail
    segments.forEach((seg, i) => {
        if(seg.x > CANVA_WIDTH - SNAKE_SIZE || seg.y > CANVA_HEIGHT - SNAKE_SIZE || seg.x < 0 || seg.y < 0 ||
            i && segments[0].x == seg.x && segments[0].y == seg.y) {
            pause = true;
            gameOver = true;
        }
    })

    // Check if a foods has been "eaten"
    foods.forEach((f, i) => {
        if(segments[0].x == f.x && segments[0].y == f.y) {
            score++
            snakeLength++
            foods.splice(i, 1)
        }
    })
}

function drawSprite(square, x, y) {
    CTX.drawImage(
        SPRITE,
        x, y,
        COL, ROW,
        square.x, square.y,
        SNAKE_SIZE, SNAKE_SIZE
    )
}

function drawFrame() {
    CTX.clearRect(0, 0, CANVA_WIDTH, CANVA_HEIGHT)

    foods.forEach(food => {
        drawSprite(food , SPRITE_COMPONENTS.apple["apple"][0], SPRITE_COMPONENTS.apple["apple"][1])
    })

    segments.forEach((segment, si) => {
        // CTX.fillStyle = "white"
        // CTX.fillRect(segment.x, segment.y, SNAKE_SIZE, SNAKE_SIZE)
        
        // ! Experimental
        if(si != 0 && si != segments.length - 1) {
            if(segment.dir != segments[si-1].dir) {
                drawSprite(segment, SPRITE_COMPONENTS.body[segment.dir + segments[si - 1].dir ][0], SPRITE_COMPONENTS.body[segment.dir + segments[si - 1].dir ][1])
            } else {
                if(segment.y == segments[si-1].y) {
                    drawSprite(segment, SPRITE_COMPONENTS.body["horizontal"][0], SPRITE_COMPONENTS.body["horizontal"][1])
                } else {
                    drawSprite(segment, SPRITE_COMPONENTS.body["vertical"][0], SPRITE_COMPONENTS.body["vertical"][1])
                }
            }
        } else if(si != 0) {
            segment.dir = segments[si - 1].dir
            drawSprite(segment, SPRITE_COMPONENTS.tail[segment.dir][0], SPRITE_COMPONENTS.tail[segment.dir][1])
        } else {
            drawSprite(segment, SPRITE_COMPONENTS.head[segment.dir][0], SPRITE_COMPONENTS.head[segment.dir][1])
        }
        // ! ================
    })
    
    CTX.fillStyle = "black"
    CTX.textAlign = "start"
    CTX.fillText(`Score: ${score}`, (SNAKE_SIZE * .2), (SNAKE_SIZE * .5))
}

// Main game function
function main() {
    CTX.font = `bold ${SNAKE_SIZE * .5}px sans-serif`

    if(pause || gameOver || win) {
        drawFrame()
        CTX.textAlign = "center"
        if(win) {
            CTX.fillStyle = "yellow"
            CTX.fillText("YOU WON!", CANVA_WIDTH / 2, CANVA_HEIGHT / 2)
            return
        }

        if(pause && !gameOver) {
            CTX.fillText("Paused", CANVA_WIDTH / 2, CANVA_HEIGHT / 2)
        } else {
            CTX.fillText("GAME OVER!", CANVA_WIDTH / 2, CANVA_HEIGHT / 2)
        }
        return;
    }

    for(let s = segments.length; s < snakeLength; s++) {
        segments.push(new square(CANVA_WIDTH / 2 - SNAKE_SIZE, CANVA_HEIGHT / 2 - SNAKE_SIZE))
    }
    
    movement();
    spawnFood()
    checks()
    drawFrame()
}

// Game restart
function restart() {
    if(!gameOver) {
        return;
    }

    // Reset value to default
    defaultValues()
}

function controls(e) {
    keystroke = e.key
    if(keystroke == " ") {
        pause == false ? pause = true : pause = false;
        return;
    } else if(keystroke == "r") {
        restart()
        return;
    }
    
    keystroke == "l" ? snakeLength++ : false
    nextMove.push(keystroke)
    nextMove.length > 3 ? nextMove.shift() : false
}

function snakeSpeed() {
    main()
    setTimeout(snakeSpeed, speed)
}
setTimeout(snakeSpeed, speed)

window.addEventListener("keydown", controls)