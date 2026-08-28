function insertNL(str) {
    if (str.length > 15) {
        // Find the last space character within the first 15 characters
        let lastSpaceIndex = str.lastIndexOf(' ');
        
        // If there's a space, replace it with a newline character
        if (lastSpaceIndex !== -1) {
            console.log(str.substring(0, lastSpaceIndex) + '\n' + str.substring(lastSpaceIndex + 1));
            return str.substring(0, lastSpaceIndex) + '\n' + str.substring(lastSpaceIndex + 1);
        }
    }
    // If the string length is not greater than 15 or no space is found, return the original string
    return str;
}

function generateCirclePositions(numElements, canvasWidth, canvasHeight) {
    const positions = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const maxRadius = Math.min(canvasWidth, canvasHeight) / 2 - 10; // Slight padding from the edges
    
    // Parameters for layers
    let radiusStep = 20; // Distance between layers
    let currentRadius = 0;
    let remainingElements = numElements;

    while (remainingElements > 0) {
        const circumference = 2 * Math.PI * currentRadius;
        const numPoints = Math.max(1, Math.floor(circumference / 20)); // At least one point per circumference
        const pointsInThisLayer = Math.min(numPoints, remainingElements);

        for (let i = 0; i < pointsInThisLayer; i++) {
            const angle = 2 * Math.PI * i / pointsInThisLayer;
            const x = centerX + currentRadius * Math.cos(angle);
            const y = centerY + currentRadius * Math.sin(angle);
            positions.push({ x, y });
        }

        remainingElements -= pointsInThisLayer;
        currentRadius += radiusStep;
    }

    return positions;
}

var count = 0;

var node_types = [
    'Entity.Organization.GovernmentOrg',    // level1
    'Entity.Organization.NGO',      // level1
    'Entity.Person', // level1
    'Entity.Organization.FishingCompany',   // level 2
    'Entity.Organization.LogisticsCompany', // level 2
    'Entity.Organization.Company',  // level 2
    'Entity.Location.Region', // level 3
    'Entity.Organization',  // level 3
    'Entity.Commodity',   // level 3
];

var node_colors = {
    'Entity.Organization.GovernmentOrg': '#AB274F',
    'Entity.Organization.NGO': '#58111A',
    'Entity.Person': '#FE6F5E',
    'Entity.Organization.FishingCompany': '#3003fc',
    'Entity.Organization.LogisticsCompany': '#fc0335',
    'Entity.Organization.Company': '#85B09A',   
    'Entity.Location.Region': '#B284BE',
    'Entity.Organization': '#E9D66B',
    'Entity.Commodity': '#138808',
};

var edge_colors = {
    "Event.Invest": "#FF00FF",
    "Event.Aid": "#FFFF00",
    "Event.Transaction": "#00FFFF",
    "Event.Fishing.SustainableFishing": "#FFA500",
    "Event.Fishing": "#800080",
    "Event.Communication.Conference": "#008080",
    "Event.Fishing.OverFishing": "#808000",
    "Event.Criticize": "#FF1493",
    "Event.Owns.PartiallyOwns": "#8B4513",
    "Event.Applaud": "#255199",
    "Event.CertificateIssued": "#7FFF00",
    "Event.CertificateIssued.Summons": "#D2691E",
    "Event.Convicted": "#FF4500"
};

// level1
var nodes_govorg = nodes.filter(d=>d.type == node_types[0]);
var nodes_ngo = nodes.filter(d=>d.type == node_types[1]);
var nodes_person = nodes.filter(d=>d.type == node_types[2]);

// level2
var nodes_fishcomp = nodes.filter(d=>d.type == node_types[3]);
var nodes_logcomp = nodes.filter(d=>d.type == node_types[4]);
var nodes_comp = nodes.filter(d=>d.type == node_types[5]);

// level3
var nodes_reg = nodes.filter(d=>d.type == node_types[6]);
var nodes_org = nodes.filter(d=>d.type == node_types[7]);
var nodes_comm = nodes.filter(d=>d.type == node_types[8]);

const element = d3.select('#content');
const fullWidth = element.node().clientWidth;
const fullHeight = element.node().clientHeight;

var nodes_outer = nodes_govorg.concat(nodes_ngo).concat(nodes_reg).concat(nodes_org).concat(nodes_comm).concat(nodes_person);
var nodes_inner = nodes_logcomp.concat(nodes_comp).concat(nodes_fishcomp);

var label_x = [0,0,0,0,0,0,0,0,0,0,
            10,10,10,10,10,10,10,
            0,0,0,0,0,0,0,0,0,0,
            -10,-10,-10,-10,-10,-10,-10];

var label_y = [-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,
            2,2,2,2,2,2,2,
            20,20,20,20,20,20,20,20,20,20,
            2,2,2,2,2,2,2];

var text_style = ['middle','middle','middle','middle','middle','middle','middle','middle','middle','middle',
                'start','start','start','start','start','start','start',
                'middle','middle','middle','middle','middle','middle','middle','middle','middle','middle',
                'end','end','end','end','end','end','end'];

const companies_cont = d3.select('#company-labels');
// Create a sorted copy of the data
const sorted_nodes = [...nodes_inner].sort((a, b) => d3.ascending(a.name, b.name));
sorted_nodes.forEach(item => {
                
        companies_cont.append("input")
                .attr("type", "checkbox")
                .attr("id", item.name)
                .attr("name", item.name)
                .attr("value", item.name);
    
    const label = companies_cont.append("label")
                .attr("for", item.name)
                .text(item.name);

            
            
            companies_cont.append("br");
        });
