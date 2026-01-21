import { parseVault } from "../parser";
import { TGStyle } from "./graph-config";
import { OnClickTGListeners, TGNoteFile, ThoughtGraph } from "./graph-structures";

export class ThoughtVisualizer extends HTMLElement {
    private _graph: ThoughtGraph;
    private _container: HTMLDivElement;

    constructor(){
        super();
        this.attachShadow({ mode: "open" });
        
        this._container = document.createElement("div");
        this._container.style.width = "100%";
        this._container.style.height = "100%";

        this.shadowRoot?.appendChild(this.getTooltipStyle() as Node);
        this.shadowRoot?.appendChild(this.getCanvasStyle());
        this.shadowRoot?.appendChild(this._container);

        this._graph = new ThoughtGraph(this._container);
    }

    set vault(files: TGNoteFile[]){
        const data = parseVault(files);
        this._graph.nodeId("id").graphData(data);
    }
    
    set graphStyle(style:TGStyle){
        const { 
            tagColors, 
            backgroundColor, 
            hoverColor, 
            defaultColor,
        } = style;

        if(hoverColor)
            this._graph.hoverColor(hoverColor);

        if(backgroundColor)
            this._container.style.backgroundColor = backgroundColor;
        
        if(defaultColor)
            this._graph.defaultColor(defaultColor);
        
        const data = this._graph.graphData();

        const dColor = this._graph.defaultColor() as string;

        if(tagColors){
            if(!tagColors["default"])
                tagColors["default"] = dColor;
            
            data.nodes.forEach(node => {
                const tags = node.tags;

                if (Array.isArray(tags) && tags.length > 0) {
                    const tag = tags[0].replace(/^#/, '');
                    node.tgColor = tagColors[tag] || tagColors["default"];
                    return;
                }
                
                node.tgColor = tagColors["default"];
            })
        }else{
            data.nodes.forEach(node => node.tgColor = dColor );
        }
    }

    set onClickListeners(listeners: OnClickTGListeners){
        const nodes = this._graph.graphData().nodes;
        if(nodes)
        Object.entries(listeners).forEach(val => {
            const [id, listener] = val;
            const node = nodes.find(node => node.id == id);
            if(node && node.clickData)
                node.clickData.callback = listener;
        })
    }

    private getTooltipStyle(){
        const injectedStyle = Array.from(document.head.querySelectorAll('style'))
        .find(style => style.textContent?.includes('.float-tooltip-kap'));
        
        if(injectedStyle)
            return injectedStyle.cloneNode(true);

        return null;
    }

    private getCanvasStyle() {
        const style = document.createElement("style");
        style.textContent = `
            .force-graph-container canvas {
                display: block;
                position: absolute;
                top: 0;
                left: 0;
            }
        `;
        return style;
    }
}

export const startVisualizer = () => {
    if (!customElements.get('thought-visualizer')) {
        customElements.define('thought-visualizer', ThoughtVisualizer);
    }
}