// ------------ Drawing stuff ------------ //
function showText(text, X, Y, Size, colour = "rgb(0, 0, 0)", bold = false, stroke = false){
	c.beginPath();
	if(bold === true){
		c.font = "bold "+Size+"px Roboto Mono";
	}
	else{
		c.font = Size+"px Roboto Mono"
	}
	c.textAlign = "center";
	if(stroke === false){
		c.fillStyle=colour;
		c.fillText(text, X, Y);
	}
	if(stroke === true){
		c.lineWidth = Size/25;
		c.strokeStyle = colour;
		c.strokeText(text, X, Y)
	}
}
class TextBox {
    constructor(string, rect, textSize, color, offset) {
        this.string = string;
        this.rect = rect;
        this.offset = offset
        this.color = color
        this.textSize = textSize;
        this.charCount = 0;
        this.percentage = 1
    }

    draw() {
        let x = this.rect[0]+this.offset[0];
		let y = this.rect[1]+this.textSize+this.offset[1];
		let w = this.rect[2];
		let h = this.rect[3];
        // wrapping logic here
        c.font = this.textSize+'px Arial';
        var words = this.string.split(' ');

        var line = '';
        var lines = [];
        for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var testWidth = c.measureText(testLine).width+this.offset[0];
            if (testWidth > w - this.offset[0] && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            }
            else {
                line = testLine;
            }
        }
        lines.push(line);

        this.charCount = 0;
        for(let line of lines){
            for(let letter of line){
                this.charCount+=1;
            }
        }

        let index = Math.round(this.charCount*this.percentage)
        let newLines = [];
        let iter = 0;
        for(let line of lines){
            let newLine = '';
            for(let letter of line){
                iter+=1;
                if(iter < index){
                    newLine += letter
                }else{
                    break;
                }
                
            }
            newLines.push(newLine);
        }
        for(var k in newLines){
            c.fillStyle = this.color;
            c.fillText(newLines[k], x, y+(k*this.textSize));
        }
    }
}

function drawArc(x,y,r,angle,col){
	c.save();
	var centerX = x;  // x coordinate of the center
	var centerY = y;  // y coordinate of the center
	var radius = r;   // radius of the arc
	var startAngle = 0; // start angle in degrees
	var endAngle = angle;  // end angle in degrees

	// Convert angles from degrees to radians
	var startAngleRad = degreesToRadians(startAngle);
	var endAngleRad = degreesToRadians(endAngle);

	c.lineWidth = 5;
	c.beginPath();
	c.arc(centerX, centerY, radius, 0, 2 * Math.PI);
	c.strokeStyle = 'lightgray';
	c.stroke();
	// Draw the arc
	c.beginPath();
	c.arc(centerX, centerY, radius, startAngleRad, endAngleRad);
	c.strokeStyle = col;
	c.stroke();
	c.restore();
}

class image{
	constructor(imageLocation){
		this.img = new Image();
		this.img.src=imageLocation;
	}	

	drawImg(X,Y,W,H, alpha, dsdx=[0,0], dwdh=[0,0]){
		c.globalAlpha = alpha;
		c.drawImage(this.img, X,Y, W,H);
		c.globalAlpha = 1;
	}

	drawRotatedImg(X, Y, W, H, alpha, rotation, rotateAroundX = 0, rotateAroundY = 0){
		c.save();
		c.translate(X, Y);
		c.rotate(rotation);
		this.drawImg(-rotateAroundX, -rotateAroundY, W, H, alpha);
		c.restore();
	}
}

class spriteSheet{
    constructor(src,wofsprite,hofsprite,animationTimer,x,y,w,h){
        this.img = new Image();
        this.img.src = src;
        this.w = wofsprite;
        this.h = hofsprite;
        this.sheetW = this.img.width;
        this.sheetH = this.img.height;
        this.fps = animationTimer;
        this.sheetX = 0;
        this.sheetY = 0;
        this.x = x;
        this.y = y;
        this.states = {};
        this.state = "";
        this.timer = 0;
        this.draww = w;
        this.drawh = h;
		this.bounce = false;
		this.changeW = this.w;
    }
    draw(alpha = 1){
        c.save();
        if(this.sheetX >= this.states[this.state][1]*this.w){
            this.sheetX = 0;
        }
		if(this.sheetX < 0){
			this.sheetX = 0;
		}
		c.globalAlpha = alpha;
        c.drawImage(this.img,this.sheetX,this.states[this.state][0],this.w,this.h,this.x,this.y,this.draww,this.drawh);
        c.restore();
    }
    addState(statename,correspondingLine,numofframes){
        this.states[statename] = [correspondingLine*this.h-this.h,numofframes];
        this.state = statename;
    }
	setState(statename){
		this.state = statename;
	}
    frameCalc(startingframe, amnt = 1){
        this.timer+=amnt;
        if (this.timer > this.fps){
            this.timer = 0;
            this.sheetX+=this.changeW;

			if(this.bounce){
				if(this.sheetX >= (this.states[this.state][1]-1)*this.w || this.sheetX <= 0){
					this.changeW *= -1;
				}

			}else{
				if(this.sheetX >= this.states[this.state][1]*this.w){
					this.sheetX = startingframe*this.w;
				}
			}
        }
    }
}

function drawLine(point1, point2, col, lw = 1,alpha=1){
    let x1 = point1[0], y1 = point1[1], x2 = point2[0], y2 = point2[1]; 
    
    c.beginPath();
    c.globalAlpha = alpha
    c.lineWidth = lw
    c.strokeStyle = col;
    c.moveTo(x1,y1);
    c.lineTo(x2,y2);
    c.globalAlpha = 1
    c.stroke();
    c.lineWidth = 1;
}

function drawRect(rect,col,fill=1,fillcolor=col,alpha=1){
    x = rect[0];
    y = rect[1];
    w = rect[2];
    h = rect[3];
    c.save();
    c.strokeStyle = col;
    c.globalAlpha = alpha;
    c.beginPath();
    c.rect(x,y,w,h);
    if (fill){
        c.fillStyle = fillcolor;
        c.fill();
    }
    c.stroke();
    c.restore();
}
function drawRoundedRect(rect, radii, col,fill=1,fillcolor=col,alpha=1){
    x = rect[0];
    y = rect[1];
    w = rect[2];
    h = rect[3];
    c.save();
    c.strokeStyle = col;
    c.globalAlpha = alpha;
    c.beginPath();
    c.roundRect(x,y,w,h,radii);
    if (fill){
        c.fillStyle = fillcolor;
        c.fill();
    }
    c.stroke();
    c.restore();
}

function drawCone(pos, startRadian, endRadian, radius=100, fillColor="black", strokeColor="black", lineWidth=1, alpha=1){
	c.save();
    const [x, y] = pos;

	c.globalAlpha = alpha;
    // Begin a new path
    c.beginPath();

    // Move to the apex of the cone
    c.moveTo(x, y);

    // Draw the arc representing the cone's circular edge
    c.arc(x, y, radius, startRadian, endRadian);

    // Close the path back to the apex
    c.lineTo(x, y);

    // Optionally, set the stroke style and line width
    if (strokeColor) {
        c.strokeStyle = strokeColor;
        c.lineWidth = lineWidth;
        c.stroke();
    }

    // Set the fill style and fill the path
    if (fillColor) {
        c.fillStyle = fillColor;
        c.fill();
    }
	c.restore();
}

function drawCircle(pos,r,col,fill=1,fillcolor=col,alpha=1, lw=1){
    let x = pos[0], y = pos[1];

    c.save();
    c.lineWidth = lw
    c.strokeStyle = col;
    c.globalAlpha = alpha;
    c.beginPath();
    c.arc(x,y,r,0,360,false);
    if (fill){
        c.fillStyle = fillcolor;
        c.fill();
    }
    c.stroke();
    c.closePath();
    c.restore();
}

function drawPolygon(vertices, color, fill, alpha,lW){
    c.save();
    c.strokeStyle = color;
    c.globalAlpha = alpha;
    c.beginPath();
    c.moveTo(vertices[0][0],vertices[0][1]);
    c.lineWidth = lW
    for(var vert of vertices){
        c.lineTo(vert[0],vert[1]);
    }
    c.lineTo(vertices[0][0],vertices[0][1])
    if (fill){
        c.fillStyle=color;
        c.fill();
    }
    c.lineWidth = 1
    c.stroke();
    c.closePath();
    c.restore();
}

function drawRotatedRect(rect, colour, rotation){
    X = rect[0];
    Y = rect[1];
    W = rect[2];
    H = rect[3];
	c.save();
	c.translate(X, Y);
	c.rotate(rotation);
	c.fillStyle = colour;
	c.beginPath();
	c.rect(-W/2,-H/2, W, H);
	c.fill();
	c.restore();
}
