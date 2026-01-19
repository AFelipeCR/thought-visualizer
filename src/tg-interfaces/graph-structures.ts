import ForceGraph, { CanvasCustomRenderFn, GraphData, LinkObject, NodeObject } from "force-graph";
import { lightenColor } from "../utils";

export interface TGNoteFile{
    name: string;
    content: string;
}

export type OnClickTGListener = (node: TGNode, event: MouseEvent) => void;

export type OnClickTGListeners = {
    [key: string]: OnClickTGListener;
};

export interface TGNode extends NodeObject {
    id: string;
    title?: string;
    tags?: string[];
    tgColor: string;
    clickData?:{
        callback?: OnClickTGListener,
        route?: {
            url: string;
            target?: "_blank" | "_self";
        }
    };
    [key: string]: any;
}

export interface TGLink extends LinkObject {
    source: string;
    target: string;
}

interface TGCanvasOptions {
    node:TGNode;
    ctx:CanvasRenderingContext2D;
    globalScale:number;
    nodeRelSize:number;
    hoverColor?: string
}

type TGCanvasCustomRenderFn = (options?:TGCanvasOptions) => void;

export interface TGData extends GraphData<TGNode, TGLink> {}

export class ThoughtGraph extends ForceGraph<TGNode, TGLink> {
    private domNode:HTMLElement;

    private readonly HOVER_COLOR = "rgb(32, 91, 216)";
    private readonly DEFAULT_COLOR = "rgb(195, 200, 211)";
    private _hoverColor: string;
    private _defaultColor: string;
    
    private readonly highlightNodes = new Set<TGNode>();
    private readonly highlightLinks = new Set<TGLink>();

    constructor(element: HTMLElement){
        super(element);
        Object.setPrototypeOf(this, ThoughtGraph.prototype);
        this.domNode = element;
        this.bindMethods();
        this.setupResponsiveGraph();
        this.setupDefaultHover();
        this.setupActions();
    }

    private setupActions(){
        this.onNodeClick((node, event) => {
            const clickData = node.clickData;

            if(clickData){
                if(clickData.callback)
                    clickData.callback(node, event)
                
                if(clickData.route)
                    window.open(clickData.route.url, clickData.route.target || "_self")
            }
        });
    }

    /* TG Methods */

    onTGNodeHover(callback?: (node: TGNode, previousNode: TGNode) => void): ThoughtGraph {
        const cb: (node: TGNode, previousNode: TGNode) => void = (node, previousNode) => {
            this.highlightNodes.clear();
            this.highlightLinks.clear();
            
            this.domNode.style.cursor = node ? "pointer" : "default";

            if (node) {
                this.highlightNodes.add(node);
                
                if(node.links)
                    node.links.forEach(link => this.highlightLinks.add(link));
            }

            if(callback)
                callback(node, previousNode);
        }

        return this.onNodeHover(cb) as ThoughtGraph;
    }

    tgNodeCanvasObjectMode(modeAccessor:string): ThoughtGraph {
        return this.nodeCanvasObjectMode(() => modeAccessor) as ThoughtGraph;
    }

    tgNodeCanvasObject(optionsFn: TGCanvasCustomRenderFn): ThoughtGraph {
        const renderFn:CanvasCustomRenderFn<TGNode> = (node, ctx, globalScale) => {
            optionsFn({
                node,
                ctx,
                globalScale,
                nodeRelSize: this.nodeRelSize(),
                hoverColor: this._hoverColor || this.HOVER_COLOR
            });
        }
        return this.nodeCanvasObject(renderFn) as ThoughtGraph;
    }

    /* Properties */

    hoverColor(hoverColor?: string) {
        if(hoverColor){
            this._hoverColor = hoverColor;
            return this;
        }

        return this._hoverColor;
    }

    defaultColor(defaultColor?:string){
        if(defaultColor){
            this._defaultColor = defaultColor;
            return this;
        }
        
        return this._defaultColor || this.DEFAULT_COLOR;
    }

    /* Binders */

    private bindMethods(){
        this.bindGraphData();
    }

    private bindGraphData(){
        const parentMethod = this.graphData.bind(this);

        this.graphData = (data?: GraphData<TGNode, TGLink>): any => {
            if(data){
                data.nodes.forEach(node => {
                    node.tgColor = this.DEFAULT_COLOR
                });
                parentMethod(data)
            }

            return parentMethod();
        }
    }

    /* Responsive */

    private setupResponsiveGraph() {
        const ro = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                this.width(width).height(height);
            }
        });

        ro.observe(this.domNode);
    }

    /* Hover */

    private setupDefaultHover(){
        this.onTGNodeHover()
        .autoPauseRedraw(false)
        .linkWidth(link => this.highlightLinks.has(link) ? 2 : 1)
        .linkDirectionalParticles(4)
        .linkDirectionalParticleWidth(link => this.highlightLinks.has(link) ? 3 : 0)
        .nodeColor(node => this.highlightNodes.has(node) ? this.HOVER_COLOR : node.tgColor)
        .linkColor(link => this.highlightLinks.has(link) ? this._hoverColor || this.HOVER_COLOR : this._defaultColor || this.DEFAULT_COLOR)
        .onNodeDrag(node => {
            this.highlightNodes.add(node);
            node.links.forEach(link => this.highlightLinks.add(link));
        })
        .onNodeDragEnd(node => {
            this.highlightNodes.delete(node)
            this.highlightLinks.clear();
        });

        this.tgNodeCanvasObjectMode("after")
        .tgNodeCanvasObject(options => {
            drawLabel(options);
            
            if(this.highlightNodes.has(options.node))
                showHighlightNode(options);
        });
    }
}

const drawLabel: TGCanvasCustomRenderFn = options => {
    const { ctx, node } = options;
    const fontSize = 4;

    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#cacaca";
    ctx.fillText(node.id, node.x, node.y + options.nodeRelSize * 2)
}

const showHighlightNode:TGCanvasCustomRenderFn = options => {
    const { ctx, node, globalScale, nodeRelSize, hoverColor } = options;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRelSize * 1.1, 0, Math.PI * 2, false);
    ctx.lineWidth = 2 / globalScale;
    ctx.strokeStyle = lightenColor(hoverColor, 0.3);
    ctx.fillStyle = hoverColor;
    ctx.fill()
    ctx.stroke()
}