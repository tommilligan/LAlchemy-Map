//Rewrite code flow so that one fucntion returns an XMLelement of a single LA element, from ewhich data can be extracted

//Color shader function - http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function increase_brightness(hex, percent){
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(hex.length == 3){
        hex = hex.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
       ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}
function log10(val) {
  return Math.log(val) / Math.LN10;
}
function addElementField() { // Add another field to form http://stackoverflow.com/questions/6099301/dynamically-adding-html-form-field-using-jquery
    var newField = $('<div><input type="text" class="searchText" autocomplete="off" /></div>');
    $('#addField-wrapper').before(newField);
    return true
}

var XMLpath = "scripts/elements.xml";
//On keyup from searchbox, search xml for name - http://stackoverflow.com/questions/12118057/search-an-xml-file-and-display-results-with-javascript
function parseXML(xml){
    var searchFor = $('#search1').val();
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
    $('#search1').on('keyup', function(){
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
    
}
function add_SVG_children(G, xml, ename, rl) { //Adds children of node ename to the graph object G, using xml. Assumes ename is already a node
    $(xml).find('parent').filter(function(){
        return $(this).text() == ename;
    }).each(function(){
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
    });
}    
function updateSVG(xml, user_input, G) { // if wishing to append, provide G: jsNetworkX Graph object to append to
    if (typeof G === 'undefined') {G = false};
    
    var central_element = $(xml).find('name').filter(function(){
        return $(this).text() == user_input;
    }).first().closest('element');
    if(central_element.length < 1) {
        $('#parents').append("<br><br><i>invalid search: "+user_input+"</i>");
        return false;
    }
    
    //Empty canvas if not appending
    if(G === false) {
        var G = new jsnx.DiGraph();
        $('#parents').empty();
    }
    else {
        $('#parents').append('<br>');
    }
    $('#counter').empty();
     
    //Add main element    
    var ename = $(central_element).find('name').text();
    G.addNode(ename, {size: 40, color: $(central_element).find('color').text()})
    
    // Write parent names in HTML
    $('#parents').append('Possible parents of '+ename+': ');
    var uniqueParents = [];
    $(central_element).find('parent').each(function(){
        var pname = $(this).text();
        if($.inArray(pname, uniqueParents) == -1) {
            uniqueParents.push(pname);
            $('#parents').append('<span class="jslink namecontainer">'+pname+'</span>, ');
        }
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
    
    //Message updates
    $('#counter').append("displaying "+node_list.length+" of 550 elements");
    
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
                return increase_brightness(d.data.color, 80);
            },
            cursor: 'pointer'
        },
        edgeStyle: {
            fill: "#AAAAAA",
            'stroke-width': 4
        },
        stickyDrag: true
    });
    
    //Add interaction functionality - http://stackoverflow.com/questions/19931307/d3-differentiate-between-click-and-drag-for-an-element-which-has-a-drag-behavior
    svg_nodes = d3.selectAll('.node');
    svg_nodes.on('dragstart', function () {
        d3.event.sourceEvent.stopPropagation(); // supress click if dragging
    });
    svg_nodes.on('click', function () {
        if (d3.event.defaultPrevented) return; // click suppressed if dragging
        node_name = d3.event['path'][0]['__data__']['node'];
        updateSVG(xml, node_name);
    });
    
    return G;
}

function startPage(xml) {
    //New jsNetworkX object
    var G = new jsnx.DiGraph();
     
    //Get data
    var element = "little alchemy"
    var children = ["combine", "elements", "make", "anything", "network", "discover", "simple"];

    // Add nodes to graph
    G.addNode(element, {size: 60, color: '#ad35ff'})
    G.addNodesFrom(children, {size: 30, color: '#DEAEFF'});

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
                return d.data.size*1;
            }
        },
        nodeStyle: {
            stroke: function(d) {
                return d.data.color;
            },
            fill: function(d) {
                return increase_brightness(d.data.color, 80);
            },
            cursor: 'pointer'
        },
        edgeStyle: {
            fill: "#AAAAAA",
            'stroke-width': 4
        }
    });
    
    $('#addField').click(function(){
        addElementField();
    });
    $('#searchform').submit(function(){
        G = updateSVG(xml, $('#search1').val());
        $('.searchText').each(function() {
            console.log($(this).val());
            G = updateSVG(xml, $(this).val(), G);
        });
    });
    $("#plotAllElements").click(function() {
        G = updateSVG(xml, 'earth');
        G = updateSVG(xml, 'air', G);
        G = updateSVG(xml, 'fire', G);
        G = updateSVG(xml, 'water', G);
    });
    $(document).on('click', ".namecontainer", function() { //use .on() as dynamic span not present at load time
        updateSVG(xml, $(this).text());
    });
}

$(document).ready(function(){
    $.ajax({
        type: "GET",
        url: XMLpath,
        dataType: "xml",
        success: startPage
    });
});