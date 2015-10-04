//Rewrite code flow so that one fucntion returns an XMLelement of a single LA element, from ewhich data can be extracted

//Color shader function - http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeColor2(color, percent) {   // (#hexval, decimal in range -1 to 1)
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
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
            $('#output').append(title.replace(reg, '<b>'+searchFor+'</b>')+' ');
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
function updateSVG(XMLelement) {
    //Empty canvas
    $('#canvas').empty();
    
    //New jsNetworkX object
    var G = new jsnx.DiGraph();
     
    //Add main element
    var element = $(XMLelement).find('name').text();
    G.addNode(element, {size: 20, color: '#DEAEFF'})
    
    // Write parent names in HTML
    $('#parent-wrapper').empty();
    $(XMLelement).find('parent').each(function(){
        var pname = $(this).text();
        var phtml = '<p>'+pname+'</p>';
        $('#parent-wrapper').append(phtml);
    }); 
    
    // Add edges (& implicit nodes) to graph
    $(XMLelement).find('child').each(function(){
        var cname = $(this).text();
        var ccolor = $(XMLelement).find('color').text();
        G.addNode(cname, {size: 10, color: ccolor});
        G.addEdge(element, cname);
    }); 
    
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
}
function uniqueXML(xml){
    var searchFor = $('#search').val();
    var element = $(xml).find('name').filter(function(){
        return $(this).text() == searchFor;
    }).closest('element');
    $('#message').empty();
    if(element.length < 1) {
        $('#message').append("<i>not valid element</i>");
        return false;
    }
    else {
        updateSVG(element);
        return true;
    }
}
$(document).ready(function(){
    $('#searchform').submit(function(){
        $.ajax({
            type: "GET",
            url: XMLpath,
            dataType: "xml",
            success: uniqueXML
        });
    });
});



//New jsNetworkX object
var G = new jsnx.DiGraph();
 
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