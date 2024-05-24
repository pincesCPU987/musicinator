function assemble (code) {
  var lines = code.split('\n');
  
  for (var i = 0; i < lines.length; i++) {
    lines[i] = lines[i].split('#')[0];
    lines[i] = lines[i].trim();
  }
  
  for (var i = 0; i < lines.length; i++) {
    if (lines[i] == '') {
      lines.splice(i, 1);
      i--;
    }
  }
  
  var output = [];
  
  var counter = 0;
  var vars = {};
  
  for (var i = 0; i < lines.length; i++) {
    var statements = lines[i].split(' ');
    
    var numjumps = 1;
    
    switch (statements[0]) {
      case 'label': {
        if (statements[1] in vars) {
          alert(`'${statements[1]}' already exists.`)
          return false;
        }
        vars[statements[1]] = counter;
        numjumps = 0;
        break;
      }
      case 'const': {
        if (statements[1] in vars) {
          throw new Error(`'${statements[1]}' already exists as a label or const.`);
        }
        if (isNaN(Number(statements[2]))) {
          throw new Error(`'${statements[2]}' cannot be parsed as a number.`);
        }
        vars[statements[1]] = Number(statements[2]);
        numjumps = 0;
        break;
      }
      
      case 'NOP': {
        output.push(0x0000);
        break;
      }
      case 'UNJMP': {
        output.push(0x0008);
        break;
      }
      case 'JMP': {
        output.push(0x000f);
        break;
      }
      
      case 'ACSET': {
        if (statements[1] == 'MEM') {
          output.push(0x0040);
        } else if (statements[1].includes('REG')) {
          var value = '0x001';
          value += statements[1].split('REG').join('');
          value = Number(value);
          
          if (isNaN(value)) {
            throw new Error('Syntax error on line ' + i + ': ' + lines[i]);
          }
          output.push(Number(value));
        } else {
          output.push(0x0041)
          if (isNaN(Number(statements[1]))) {
            output.push(statements[1]);
          } else {
            output.push(Number(statements[1]));
          }
          numjumps = 2;
        }
        break;
      }
      case 'REGSET': {
        var value;
        if (('0123456789abcdefABCDEF').split('').indexOf(statements[1]) >= 0) {
          var value2;
          if (statements[2] == 'AC') {
            value = '0x003';
          } else {
            value = '0x002';
            if (isNaN(Number(statements[2]))) {
              value2 = statements[2];
            } else {
              value2 = Number(statements[2]);
            }
          }
          value += statements[1];
          value = Number(value);
          output.push(value);
          if (typeof value2 != 'undefined') {
            output.push(value2);
            numjumps = 2;
          }
        } else if (statements[1] == 'M') {
          if (statements[2] == 'AC') {
            output.push(0x0048);
          } else {
            output.push(0x0049);
            if (isNaN(Number(statements[2]))) {
              output.push(statements[2]);
            } else {
              output.push(Number(statements[2]));
            }
            numjumps = 2;
          }
        }
        break;
      }
      
      case 'JMPEQ': {
        output.push(0x0050);
        if (isNaN(Number(statements[1]))) {
          output.push(statements[1]);
        } else {
          output.push(Number(statements[1]));
        }
        numjumps = 2;
        break;
      }
      case 'JMPNEQ': {
        output.push(0x0051);
        if (isNaN(Number(statements[1]))) {
          output.push(statements[1]);
        } else {
          output.push(Number(statements[1]));
        }
        numjumps = 2;
        break;
      }
      case 'JMPLT': {
        output.push(0x0052);
        if (isNaN(Number(statements[1]))) {
          output.push(statements[1]);
        } else {
          output.push(Number(statements[1]));
        }
        numjumps = 2;
        break;
      }
      case 'JMPLTE': {
        output.push(0x0053);
        if (isNaN(Number(statements[1]))) {
          output.push(statements[1]);
        } else {
          output.push(Number(statements[1]));
        }
        numjumps = 2;
        break;
      }
      case 'JMPGT': {
        output.push(0x0054);
        if (isNaN(Number(statements[1]))) {
          output.push(statements[1]);
        } else {
          output.push(Number(statements[1]));
        }
        numjumps = 2;
        break;
      }
      case 'JMPGTE': {
        output.push(0x0055);
        if (isNaN(Number(statements[1]))) {
          output.push(statements[1]);
        } else {
          output.push(Number(statements[1]));
        }
        numjumps = 2;
        break;
      }
      
      case 'ADD': {
        if (statements[1] == 'MEM') {
          output.push(0x0070);
        } else {
          output.push(0x0060);
          numjumps = 2;
          if (isNaN(Number(statements[1]))) {
            output.push(statements[1]);
          } else {
            output.push(Number(statements[1]));
          }
        }
        break;
      }
      case 'SUB': {
        if (statements[1] == 'MEM') {
          output.push(0x0071);
        } else {
          output.push(0x0061);
          numjumps = 2;
          if (isNaN(Number(statements[1]))) {
            output.push(statements[1]);
          } else {
            output.push(Number(statements[1]));
          }
        }
        break;
      }
      case 'RSHIFT': {
        if (statements[1] == 'MEM') {
          output.push(0x0074);
        } else {
          output.push(0x0064);
          numjumps = 2;
          if (isNaN(Number(statements[1]))) {
            output.push(statements[1]);
          } else {
            output.push(Number(statements[1]));
          }
        }
        break;
      }
      case 'LSHIFT': {
        if (statements[1] == 'MEM') {
          output.push(0x0075);
        } else {
          output.push(0x0065);
          numjumps = 2;
          if (isNaN(Number(statements[1]))) {
            output.push(statements[1]);
          } else {
            output.push(Number(statements[1]));
          }
        }
        break;
      }
      case 'AND': {
        if (statements[1] == 'MEM') {
          output.push(0x0078);
        } else {
          output.push(0x0068);
          numjumps = 2;
          if (isNaN(Number(statements[1]))) {
            output.push(statements[1]);
          } else {
            output.push(Number(statements[1]));
          }
        }
        break;
      }
      case 'OR': {
        if (statements[1] == 'MEM') {
          output.push(0x0079);
        } else {
          output.push(0x0069);
          numjumps = 2;
          if (isNaN(Number(statements[1]))) {
            output.push(statements[1]);
          } else {
            output.push(Number(statements[1]));
          }
        }
        break;
      }
      case 'XOR': {
        if (statements[1] == 'MEM') {
          output.push(0x007a);
        } else {
          output.push(0x006a);
          numjumps = 2;
          if (isNaN(Number(statements[1]))) {
            output.push(statements[1]);
          } else {
            output.push(Number(statements[1]));
          }
        }
        break;
      }
      case 'NOT': {
        output.push(0x006c);
        break;
      }
      
      case 'SQAFREQ': {
        output.push(0x0080);
        break;
      }
      case 'SQAVOL': {
        output.push(0x0081);
        break;
      }
      case 'SQBFREQ': {
        output.push(0x0084);
        break;
      }
      case 'SQBVOL': {
        output.push(0x0085);
        break;
      }
      case 'TRIFREQ': {
        output.push(0x0088);
        break;
      }
      case 'TRIVOL': {
        output.push(0x0089);
        break;
      }
      case 'FUZFREQ': {
        output.push(0x008c);
        break;
      }
      case 'FUZVOL': {
        output.push(0x008d);
        break;
      }
      
      default: {
        throw new Error(`${statements[0]} is not a valid instruction.`);
      }
    }
    counter += numjumps;
  }
  for (var i = 0; i < output.length; i++) {
    if (typeof output[i] == 'string') {
      if (output[i] in vars) {
        output[i] = vars[output[i]];
      } else {
        throw new Error(output[i] + ' does not exist.');
      }
    }
  }
  return output;
}

var input = document.querySelector('#input');

var clickers = document.querySelectorAll('.clicker');
for (var i = 0; i < clickers.length; i++) {
  clickers[i].onclick = (e) => {
    input.value += document.querySelector(`template[name=${e.target.getAttribute('name')}]`).innerHTML;
  }
}

var download = document.querySelector('#assemble');

download.onclick = (e) => {
  try {
    var output = assemble(input.value);
  } catch(a) {
    alert(a.message);
    return;
  }
  console.log(output);
  var arr = new Uint8Array(128 * 1024);
  
  for (var i = 0; i < output.length; i++) {
    var hex = output[i].toString(16).padStart(4, '0');
    var lower = hex.substring(2, 4);
    var upper = hex.substring(0, 2);
    arr[i * 2] = Number('0x' + lower);
    arr[(i * 2) + 1] = Number('0x' + upper);
  }
  var blob = new Blob([arr], {type: 'application/octet-stream'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  document.documentElement.appendChild(a);
  a.download = 'thing.nesnoise';
  a.href = url;
  a.click();
  document.documentElement.removeChild(a);
  setTimeout(() => {URL.revokeObjectURL(blob);}, 1000);
}
