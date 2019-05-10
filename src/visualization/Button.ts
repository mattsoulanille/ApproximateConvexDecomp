import * as PIXI from "pixi.js";

class Button {
    container: PIXI.Container;
    text: PIXI.Text;
    background: PIXI.Graphics;
    constructor(text: string) {
        this.container = new PIXI.Container();
        this.text = new PIXI.Text(text, style);
        this.background = new PIXI.Graphics();
        this.container.addChild(this.background);
        this.container.addChild(this.text);
        this.background.lineStyle(this.text.height + 4, 0x888800);
        const ypos = this.text.position.y + this.text.height / 2 - 2;
        this.background.moveTo(this.text.position.x - 2, ypos);
        this.background.lineTo(this.text.position.x + this.text.width + 2, ypos);
        this.container.interactive = true;
        this.container.buttonMode = true;

    }

    set onPress(f: () => void) {
        this.container.addListener("pointerup", f);
    }
}



const style = new PIXI.TextStyle({
    fill: "white"
})

export { Button }
