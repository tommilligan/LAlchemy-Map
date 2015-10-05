//Rewrite code flow so that one fucntion returns an XMLelement of a single LA element, from ewhich data can be extracted

//Color shader function - http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeColor2(color, percent) {   // (#hexval, decimal in range -1 to 1)
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
function log10(val) {
  return Math.log(val) / Math.LN10;
}

var XMLpath = "scripts/elements.xml";
//On keyup from searchbox, search xml for name - http://stackoverflow.com/questions/12118057/search-an-xml-file-and-display-results-with-javascript
function parseXML(xml){
    var searchFor = $('#search').val();
    var reg = new RegExp(searchFor, "i");
    $('#output').empty();
    $(xml).find('element').each(function(){
        var title = $(this).find('name').text();
        var titleSearch = title.search(reg);
        if(titleSearch > -1){
            $('#output').append(title.replace(reg, '<b>'+searchFor+'</b>')+', ');
        }
    });    
}
$(document).ready(function(){
    $('#search').on('keyup', function(){
        $.ajax({
            type: "GET",
            url: XMLpath,
            dataType: "xml",
            success: parseXML
        });
    });
});

//On submit from searchbox, search xml for name & update svg
function uniqueXML(xml, attribute_name, attribute_value){
    var element = $(xml).find(attribute_name).filter(function(){
        return $(this).text() == attribute_value;
    }).closest('element');
    $('#message').empty();
    if(element.length < 1) {
        $('#message').append("<i>invalid search: "+attribute_name+": "+attribute_value+"</i>");
        console.log("invalid search: "+attribute_name+": "+attribute_value);
        return false;
    }
    else {
        return element;
    }
}
function add_SVG_children(G, xml, ename, rl) { //Adds children of node ename to the graph object G, using xml. Assumes ename is already a node
    $(xml).find('parent').each(function(){
        var check_ename = $(this).text();
        if(check_ename == ename){
            child_element = $(this).closest('element');
            cname = child_element.find('name').text();
            ccolor = child_element.find('color').text();
            r_rl_ratio = 0.5; //Alter this to change how fast nodes reduce in size
            rsize = Math.ceil(10 * (rl * r_rl_ratio)); 
            G.addNode(cname, {size: rsize, color: ccolor});
            G.addEdge(ename, cname);
            
            if(rl > 1) {
                add_SVG_children(G, xml, cname, rl-1);
            }
        }
    });
}    
function updateSVG(xml) {
    //Empty canvas
    $('#canvas').empty();
    
    //New jsNetworkX object
    var G = new jsnx.Graph();
     
    //Add main element
    var central_element = uniqueXML(xml, 'name', $('#search').val())
    var ename = $(central_element).find('name').text();
    G.addNode(ename, {size: 40, color: $(central_element).find('color').text()})
    
    // Write parent names in HTML
    $('#parent-wrapper').empty();
    $(central_element).find('parent').each(function(){
        var pname = $(this).text();
        var phtml = '<p>'+pname+'</p>';
        $('#parent-wrapper').append(phtml);
    }); 
    
    // Add nodes and edges to graph
    var rl = $('#recurse_levels').val();
    add_SVG_children(G, xml, ename, rl);      
    
    // Optional adjustment of nodes - G.nodes()
    node_list = G.nodes()
    for(i=0;i<node_list.length;i++){
        node_map = G.get(node_list[i]);
        neighbour_map = node_map['_stringValues'];
        size = 0;
        for (var key in neighbour_map) {
            size++;
        }
        radius = Math.ceil(log10(2+size)*15); // 2+ ensures min value is 2
        G.addNode(node_list[i], {size: radius}); // Modify here ??? Modify or fade colour here?
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
                return d.data.size*1; // Adjust this for scale factor if needed. Adjust size property for size
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
}
$(document).ready(function(){
    $('#searchform').submit(function(){
        $.ajax({
            type: "GET",
            url: XMLpath,
            dataType: "xml",
            success: updateSVG
        });
    });
});



//New jsNetworkX object
var G = new jsnx.Graph();
 
//Get data
var element = "lava"
var parents = ["earth", "fire"]
var children = ["volcano", "stone", "lava lamp", "darth vader", "obsidian", "granite"];

// Write parent names in HTML
document.getElementById("parent-wrapper").innerHTML = parents[0]+parents[1]

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