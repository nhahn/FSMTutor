// set up SVG for D3
var width  = 960,
    height = 500,
    colors = d3.scale.category10();

var svg = d3.select('#fsm')
  .append('svg')
  .attr('oncontextmenu', 'return false;')

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
var nodes = [
    {id: 0, reflexive: false}
    //{id: 1, reflexive: true },
    //{id: 2, reflexive: false}
  ],
  lastNodeId = 0,
  links = [
    //{source: nodes[0], target: nodes[1], left: false, right: true },
    //{source: nodes[1], target: nodes[2], left: false, right: true }
  ];

//We set this variable to true when we are waiting for a response
//from the CTAT service. It disables the event listeners
var frozen = false;

// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .linkDistance(200)
    .charge(-1500)
    .on('tick', tick)

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

var radius = 20; //Set the side of our nodes

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');
    linktext_event = svg.append("svg:g").selectAll("g.linklabelholder");
    linktext_action = svg.append("svg:g").selectAll("g.linklabelholder");


// mouse event vars
var selected_node = null, //This is set if we have a node in error
    selected_link = null, //This is set if we have a link in error
    mousedown_link = null,
    mousedown_node = null,
    hover_node = null, //To check which node we are hovering over
    mouseup_node = null,
    highlight = null;

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
  hover_node = null;
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        diff = deltaX - deltaY,
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = radius,
        targetPadding = radius + 5,
        offsetPadding = 9,
        sourceX = d.source.x + (sourcePadding * normX) + (offsetPadding * normY),
        sourceY = d.source.y + (sourcePadding * normY) - (offsetPadding * normX),
        targetX = d.target.x - (targetPadding * normX) + (offsetPadding * normY),
        targetY = d.target.y - (targetPadding * normY) - (offsetPadding * normX); //this is how we add in our line curves
    
    if (d.target == d.source) {
       var angle = Math.atan2(svg.attr("height") / 2 - d.source.y, svg.attr("width") / 2 - d.source.x);
       var length = 55;
      
       var sourceX = d.source.x + radius * Math.cos(angle + Math.PI * .5);
       var sourceY = d.source.y + radius * Math.sin(angle + Math.PI * .5);
       var targetX = d.source.x - ((radius + 3) * Math.cos(angle + Math.PI * .5));
       var targetY = d.source.y - ((radius + 3) * Math.sin(angle + Math.PI * .5));
       
       var lPointX = sourceX - length * Math.cos(angle - Math.PI * .05);
       var lPointY = sourceY - length * Math.sin(angle - Math.PI * .05);
       var lCurveX = lPointX - 15 * Math.cos(angle - Math.PI * .55);
       var lCurveY = lPointY - 15 * Math.sin(angle - Math.PI * .55);
         
       var rPointX = targetX - length * Math.cos(angle + Math.PI * .05);
       var rPointY = targetY - length * Math.sin(angle + Math.PI * .05);
       var rCurveX = rPointX - 15 * Math.cos(angle + Math.PI * .55);
       var rCurveY = rPointY - 15 * Math.sin(angle + Math.PI * .55);
      
       return "M" + sourceX + "," + sourceY + "Q" + lCurveX + "," + lCurveY + " " + lPointX + "," + lPointY + 
         "L" + rPointX + "," + rPointY + "Q" + rCurveX + "," + rCurveY + " " + targetX + "," + targetY;
       //return "M" + sourceX + "," + sourceY + "A" + 30 + "," + 30 + " " + xRotation + "," + largeArc + "," + sweep + " " + targetX + "," + targetY; 
    } 
    
    return 'M' + sourceX + ',' + sourceY + "A" + 
            dist + "," + dist + " 0 0,1 " + targetX + ',' + targetY;
    //TODO deal with flipping this
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return ''; })
    .style('stroke', function(d) { return (d === highlight)? '#FFD700' : '' })
    .style('marker-end', function(d) { return 'url(#end-arrow)'; });


  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return ''; })
    .attr("id",function(d,i) { return "linkId_" + i; })
    .style('marker-end', function(d) { return 'url(#end-arrow)'; })
    .on('mousedown', function(d) {
      //This is when we add a model to assign an event
      d3.event.stopPropagation();
      if(frozen) return;
      if (d.event || d.action) return;
      $("#transitionEvent").html("Event <div class='CTATComboBox'></div>")
      var event = $("#transitionEvent div")
      event.attr("id", "eventFromState"+d.source.id+"ToState"+d.target.id);
      event.append($("<option></option>").attr("value", "").text("Select an Event"));
      $.each(['mouseDown', 'mouseUp', 'mouseMoveOutside', 'mouseMoveInside'], function(key, value) {   
        event.append($("<option></option>")
         .attr("value",value)
         .text(value)); 
      });
      addCTATElement(event[0]);
      $("#transitionAction").html("Action <div class='CTATComboBox'></div>")
      var action = $("#transitionAction div")
      action.attr("id", "actionFromState"+d.source.id+"ToState"+d.target.id);
      action.append($("<option></option>").attr("value", "").text("Select an Action"));
      $.each(['highlightButton', 'noAction', 'performButtonAction', 'unhighlightButton', 'depressedButton', 'undepressedButton'], function(key, value) {   
        action.append($("<option></option>")
         .attr("value",value)
         .text(value)); 
      });
      addCTATElement(action[0]);
      $('#transitionModal').foundation('open');
    }).on('mouseover', function(d) {
      d3.select(this).style('stroke-width', '6px').style('cursor', 'pointer');
    }).on('mouseout', function(d) {
      d3.select(this).style('stroke-width', '4px').style('cursor', 'default');
    });

  linktext_event = linktext_event.data(force.links().filter(function(d) { return d.event}));
     linktext_event.enter().append("g").attr("class", "linklabelholder")
     .append("text")
     .attr("class", "linklabel")
	 .style("font-size", "13px")
     .attr("dx",5)
     .attr("dy",-5)
     .attr("text-anchor", "start")
	 .style("fill","#000")
	 .append("textPath")
     .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
     .text(function(d) { 
	   return d.event; 
     });
    //TODO maybe rotate text here?
  
   linktext_action = linktext_action.data(force.links().filter(function(d) { return d.action}));
     linktext_action.enter().append("g").attr("class", "linklabelholder")
     .append("text")
     .attr("class", "linklabel")
	 .style("font-size", "13px")
     .attr("dx",10)
     .attr("dy",15)
     .attr("text-anchor", "start")
	 .style("fill","#000")
	 .append("textPath")
     .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
     .text(function(d) { 
	   return d.action; 
     });
  
  
  // remove old links
  path.exit().remove();

  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) { return (d === selected_node)? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .style('stroke', function(d) { return (d === selected_node)? '#F00' : (d === highlight)? '#FFD700' : d3.rgb(colors(d.id)).darker().toString(); })
    .style('stroke-width', function(d) { return (d === highlight)? '6px' : '1.5px' })
    .classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', radius)
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {
      d3.select(this).attr('transform', 'scale(1.1)');
      // enlarge target node
      hover_node = d;
    })
    .on('mouseout', function(d) {
      d3.select(this).attr('transform', '');
      // unenlarge target node
      hover_node = null;
    })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;
      if(frozen) return;

      // select node
      mousedown_node = d;

      // reposition drag line
      drag_line
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

      restart();
    })
    .on('mouseup', function(d) {
      if(d3.event.ctrlKey) return;
      if(!mousedown_node) return;
      if(frozen) return;

      // needed by FF
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');

      // check for drag-to-self
      mouseup_node = d;
      //if(mouseup_node === mousedown_node) { resetMouseVars(); return; } 
      //TODO this is a self-referencing state -- support this

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      var source, target, direction;
      source = mousedown_node;
      target = mouseup_node;
      direction = 'right';

      var link;
      link = findLink(source, target);

      if(link) {
        resetMouseVars();
        return;
      } else {
        link = {source: source, target: target, left: false, right: false};
        link[direction] = true;
        links.push(link);
      }

      // select new link
      selected_node = null;
      sendMessage("State"+source.id, "UpdateList", "State"+target.id)
      restart();
    });

  // show node IDs
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) { return d.id; });

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

 function addCTATElement(elem) {
      var $ctat_component$$ = new CTAT.ComponentRegistry["CTATComboBox"];
      console.log("Attaching CTAT tutoring to " + $(elem).attr("id"));
      $(elem).attr("id") ? $ctat_component$$.setName($(elem).attr("id")) : (elem.id = CTATGlobalFunctions.div_id(), $ctat_component$$.setName(elem.id));
      $ctat_component$$.setDivWrapper(elem);
      $ctat_component$$.processAttributes();
      $ctat_component$$.init();
      $(elem).data("CTATComponent", $ctat_component$$);
  }
  

function findLink (source, target) {
  return links.filter(function(l) {
    return (l.source === source && l.target === target);
  })[0];
}

function findLinkById (source, target) {
  return links.filter(function(l) {
    return (l.source.id == source && l.target.id == target);
  })[0];
}

function mousedown() {
  // prevent I-bar on drag
  //d3.event.preventDefault();

  // because :active only works in WebKit?
  svg.classed('active', true);

  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;
  if(frozen) return;

  // insert new node at point
  var point = d3.mouse(this),
      node = {id: ++lastNodeId, reflexive: false};
  node.x = point[0];
  node.y = point[1];
  nodes.push(node);
  
  restart();
  // @FSMTutor this is where we send our command
  // for a new node
  sendMessage("State"+lastNodeId, "UpdateText", "createState");
}

function mousemove() {
  if(!mousedown_node) return;
  if(frozen) return;

  // update drag line
  //TODO change dragline to be a self-referencing one in the case it is hovering over the same node
  if (mousedown_node == hover_node) {

    var angle = Math.atan2(svg.attr("height") / 2 - mousedown_node.y, svg.attr("width") / 2 - mousedown_node.x);
    var length = 55;

    var sourceX = mousedown_node.x + radius * Math.cos(angle + Math.PI * .5);
    var sourceY = mousedown_node.y  + radius * Math.sin(angle + Math.PI * .5);
    var targetX = mousedown_node.x - ((radius + 3) * Math.cos(angle + Math.PI * .5));
    var targetY = mousedown_node.y - ((radius + 3) * Math.sin(angle + Math.PI * .5));

    var lPointX = sourceX - length * Math.cos(angle - Math.PI * .05);
    var lPointY = sourceY - length * Math.sin(angle - Math.PI * .05);
    var lCurveX = lPointX - 15 * Math.cos(angle - Math.PI * .55);
    var lCurveY = lPointY - 15 * Math.sin(angle - Math.PI * .55);

    var rPointX = targetX - length * Math.cos(angle + Math.PI * .05);
    var rPointY = targetY - length * Math.sin(angle + Math.PI * .05);
    var rCurveX = rPointX - 15 * Math.cos(angle + Math.PI * .55);
    var rCurveY = rPointY - 15 * Math.sin(angle + Math.PI * .55);
      
    drag_line.attr('d' , "M" + sourceX + "," + sourceY + "Q" + lCurveX + "," + lCurveY + " " + lPointX + "," + lPointY + 
         "L" + rPointX + "," + rPointY + "Q" + rCurveX + "," + rCurveY + " " + targetX + "," + targetY);
  
  } else 
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

  restart();
}

function mouseup() {
  if(frozen) return;

  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

// only respond once per keydown
var lastKeyDown = -1;
var drag = force.drag()
  .on("dragstart", function(d) {
    d.fixed = true; 
  });

function keydown() {
  d3.event.preventDefault();

  if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(drag);
    svg.classed('ctrl', true);
  }
  
  if(hover_node && d3.event.keyCode === 69 ) {
    sendMessage("State"+hover_node.id, "UpdateText", "End")
  }

  if(!selected_node && !selected_link) return;
  switch(d3.event.keyCode) {
    case 8: // backspace
    case 46: // delete
      if(selected_node) {
        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
        lastNodeId--; //We only delete on error (so it is safe to decriment this)
      } else if(selected_link) {
        links.splice(links.indexOf(selected_link), 1);
      }
      clearFrozen();
      selected_link = null;
      selected_node = null;
      restart();
      break;
  }
}

function keyup() {
  lastKeyDown = -1;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
}

function sendMessage(selection, action, input) {
  frozen = true;
  highlight = null;
  commShell.gradeSAI(selection, action, input);
}

function clearFrozen() {
  frozen = false;
}

// app starts here
svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup);
d3.select(window)
  .on('keydown', keydown)
  .on('keyup', keyup);

function gradingFix(selection, action, input) {
  switch (action) {
    case 'UpdateText':
      selected_node = nodes.filter(function(n) {
        return (n.id == parseInt(selection.substring(5)));
      })[0];
      restart();
      break;
    case 'UpdateList':
      selected_link = findLinkById(parseInt(selection.substring(5)), parseInt(input.substring(5)));
      restart();
      break;
  }
}

function processCorrect(selection, action, input) {
  switch (action) {
    case 'UpdateComboBox':
      var match = /(action|event)FromState(\d+)ToState(\d+)/.exec(selection);
      if (match != null) {
        var link = findLinkById(parseInt(match[2]), parseInt(match[3]));
        link[match[1]] = input;
        restart();
      }
      break;
  }
}

function highlightHandler(shouldHighlight, message) {
  console.log("Highlight: " + shouldHighlight + " " + message.getSelection() + " " + message.getAction() + " " + message.getInput());
  switch (message.getAction()) {
    case 'UpdateList': //Transition in this case
      var match = /State(\d+)/.exec(message.getSelection());
      highlight = nodes.filter(function(n) {
        return (n.id == parseInt(match[1]));
      })[0];
      restart();
      break;      
    case 'UpdateText':  
//      if (message.getAction() == 'End')
//      
//      else 
      console.log("not sure what to do here");
      break;
    case 'UpdateComboBox':
      var match = /(action|event)FromState(\d+)ToState(\d+)/.exec(message.getSelection());
      if (match != null) {
        highlight = findLinkById(parseInt(match[2]), parseInt(match[3]));
        restart();
      }
      break;
  }
}

$(window).on('closed.zf.reveal', function() {
   $("#transitionEvent div").html("").removeAttr('data-ctat-component').removeAttr('id');
   $("#transitionAction div").html("").removeAttr('data-ctat-component').removeAttr('id');
});

resize();
d3.select(window).on("resize", resize);
restart();

function resize() {
  var width = $("#fsm").width();
  var height = window.innerHeight - 230;
  svg.attr("width", width).attr("height", height);
  force.size([width, height]).resume();
}

