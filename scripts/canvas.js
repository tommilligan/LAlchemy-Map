//Color shader function - http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeColor2(color, percent) {   // (#hexval, decimal in range -1 to 1)
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

//New jsNetworkX object
var G = new jsnx.DiGraph();
 
//Get data
var element = "lava"
var parents = ["earth", "fire"]
var children = ["volcano", "stone", "lava lamp", "darth vader", "obsidian", "granite"];

// Write parent names in HTML
for (i=0; i<2; ++i) {
    document.getElementById("parent"+i.toString()).innerHTML = parents[i]
}

// Add nodes to graph
G.addNode(element, {size: 20, color: '#DEAEFF'})
G.addNodesFrom(children, {size: 10, color: '#DEAEFF'}); //in format [('',{}), ('',{}), ('',{})], {}

// Connect nodes with edges
for (i=0; i<children.length; ++i) {
    G.addEdge(element, children[i]);
}

//Draw graph
jsnx.draw(G, {
    element: '#canvas',  
    weighted: false,
    withLabels: true,
    layoutAttr: {
        charge: -500, //default -120
        linkDistance: 100
    },
    nodeAttr: {
        r: function(d) {
            return d.data.size*1.5;
        }
    },
    nodeStyle: {
        stroke: function(d) {
            return d.data.color;
        },
        fill: function(d) {
            return shadeColor2(d.data.color, 0.8);
        },
        cursor: 'pointer'
    },
    edgeStyle: {
        fill: "#AAAAAA",
        'stroke-width': 4
    }
});