/**
 * A database of Card information
 * Each card has the following attributes...
 * 
 * fullsize: The path to the fullsize image 
 * photo_placeholders : The area of the fullisize image in which the photo will be placed.
 * text_placeholders : An array of placeholders where text can be added to the card.
 *  Each text_placeholders must have a 'font', 'fill' (the color) and a 'gravity' (where the text will appear on the image)
 *  The gravity can be offset using optional 'x' and 'y' parameters
 *  (Please refer to pixenate/docs/API-Reference.html for more information on the add_text() operation)
 *  (e.g. gravity: "SouthEast", x: 100, y: 200 will cause the text to appear in the bottom right corner 100 pixels from the right and 200 pixels from the bottom.
 *        gravity: "NorthWest", x: 50, y: 75 will cause the text to appear in the top left corner 50 pixels from the left and 75 pixels from the top.
 */
var gCardDB = {
    'birthday1.jpg': 
    { 
       fullsize: 'cards/birthday1.png', 
       photo_placeholders: 
       [
          {left: 80, top: 140, width: 840,height: 840}
       ],
       text_placeholders: 
       [
          {gravity: "NorthWest", x: 120, y: 1040, font: "arial", pointsize: 64, fill: "#000000",multiline: true}
       ]
    },
    'birthday2.jpg': 
    {
       fullsize: 'cards/birthday2.png', 
       photo_placeholders: 
       [
          {left: 80, top: 140, width: 840,height: 840}
       ],
       text_placeholders: 
       [
          {gravity: "NorthWest", x: 120, y: 1040, font: "arial", pointsize: 64, fill: "#FFFFFF",multiline: true}
       ]
    },
    'birthday3.jpg': 
    {
       fullsize: 'cards/birthday3.png', 
       photo_placeholders: 
       [
          {left: 80, top: 140, width: 840,height: 840}
       ],
       text_placeholders: 
       [
          {gravity: "NorthWest", x: 120, y: 1040, font: "arial", pointsize: 64, fill: "#000000",multiline: true}
       ]
    },
    'birthday4.jpg': 
    {
       fullsize: 'cards/birthday4.jpg', 
       photo_placeholders: 
       [
          {left: 80, top: 140, width: 840,height: 840}
       ],
       text_placeholders: 
       [
          {gravity: "NorthWest", x: 120, y: 1040, font: "arial", pointsize: 64, fill: "#000000",multiline: true}
       ]
    },
    'getwellsoon1.jpg': 
    {
       fullsize: 'cards/getwellsoon1.png', 
       photo_placeholders: 
       [
          {left: 80, top: 160, width: 1240,height: 680}
       ],
       text_placeholders: 
       [
          {gravity: "North", y: 880, font: "arial", pointsize: 64, fill: "#000000",multiline: false}
       ]
    },
    'getwellsoon2.jpg': 
    {
       fullsize: 'cards/getwellsoon2.png', 
       photo_placeholders: 
       [
          {left: 80, top: 160,  width: 1240,height: 680}
       ],
       text_placeholders: 
       [
          {gravity: "North", y: 880, font: "arial", pointsize: 64, fill: "#000000",multiline: false}
       ]
    },
    'getwellsoon3.jpg': 
    {
       fullsize: 'cards/getwellsoon3.png', 
       photo_placeholders: 
       [
          {left: 80, top: 160, width: 1240,height: 680}
       ],
       text_placeholders: 
       [
          {gravity: "North", y: 880, font: "arial", pointsize: 64, fill: "#000000",multiline: false}
       ]
    },
    'weddinginvitation1.jpg': 
    {
       fullsize: 'cards/weddinginvitation1.jpg',
       photo_placeholders: 
       [
          {left: 80,  top: 240, width: 600, height: 520},
          {left: 720, top: 240, width: 600, height: 520}
       ],
       text_placeholders: 
       [
          {gravity: "North", y: 800, font: "Arial", pointsize: 64, fill: "#303030",multiline: true}
       ]
    }
};
