import { load } from "js-yaml";
import { TGNoteFile, TGData, TGLink, TGNode } from "./tg-interfaces";

export function parseVault(files: TGNoteFile[]){
    const nodes: TGNode[] = [];
    const links: TGLink[] = [];

    const cleanName = (name: string) => name.replace(/\.md$/, '');

    const wikiLinkRegex = /\[\[(.*?)\]\]/g;
    const frontmatterRegex = /^\s*---\s*\n([\s\S]+?)\n\s*---\s*/;

    files.forEach(file => {
        const id = cleanName(file.name);
        const fmMatch = file.content.match(frontmatterRegex);
        let metadata: any = {};

        if(fmMatch){
            try{
                metadata = load(fmMatch[1]);
            } catch (e){
                console.error(`YAML Error: ${file.name}`);
            }
        }
        
        nodes.push({
            id,
            tags: metadata.tags || [],
            clickData: {
                route: {
                    url: metadata.url,
                    target: metadata.target
                }
            },
            ...metadata
        });

        let linkMatch;

        while((linkMatch = wikiLinkRegex.exec(file.content)) !== null){
            const target = linkMatch[1].split("|")[0].trim();

            links.push({
                source: id,
                target: cleanName(target)
            })
        }
    });

    

    return crossLinkNodes({ nodes, links });
}

function crossLinkNodes(data:TGData){
     data.links.forEach(link => {
        const a = data.nodes.find(n => n.id == link.source);
        const b = data.nodes.find(n => n.id == link.target);

        !a.links && (a.links = []);
        !b.links && (b.links = []);
        a.links.push(link);
        b.links.push(link);
    });

    return data;
}