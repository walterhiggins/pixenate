function showCode(elementId)
{
    var wnd = window.open("",elementId,
                          "height=200, width=640, scrollbars=1, resizable=1, location=0, menubar=0, toolbar=0");
    var doc = wnd.document;
    doc.open("text/plain");
    var lines = code[elementId];
    
    for (var i = 0;i < lines.length;i++){
        if (document.all){
            doc.write(lines[i]);
        }else{
            doc.writeln(lines[i]);
        }
    }
    doc.close();
    return false;
}

function PadDigits(n, totalDigits) 
{ 
    n = n.toString(); 
    var pd = ''; 
    if (totalDigits > n.length) 
    { 
        for (i=0; i < (totalDigits-n.length); i++) 
        { 
            pd += ' '; 
        } 
    } 
    return pd + n.toString(); 
} 
code = {};

window.onload = function()
{
    var textareas = document.getElementsByTagName("textarea");
    
    for (var i = 0; i < textareas.length; i++){
        var textarea = textareas.item(i);
        
        if (textarea.className == "code"){
            var temp = textarea.value;
            temp = temp.replace(/&lt;/g,"<");
            temp = temp.replace(/&gt;/g,">");
            temp = temp.replace(/\n$/g,"");
            
            //
            // Firefox bug - last value of textarea isn't cleared in firefox
            // when user clicks the reload button
            //
            var lines = temp.split(/\n/);
            for  (var k = 0; k < lines.length; k++){
                lines[k] = lines[k].replace(/^ *\d+\: /,"");
            }
            code[textarea.id] = lines;
        }
    }
    
    for (var i in code){
        
        var textarea = document.getElementById(i);
        var newValue = "";
        var lines = code[i];
        var cols = 0;
        var digits = Math.floor(Math.LOG10E * Math.log(lines.length)) + 1;
        for (var j = 0; j < lines.length; j++){
            var newLine = PadDigits(j+1,3) + ": " + lines[j];
            if (newLine.length > cols){
                cols = newLine.length;
            }
            newValue = newValue + newLine + "\n";
        }
        textarea.value = newValue;
        textarea.rows = lines.length;
        textarea.cols = cols + 2;
    }
};

