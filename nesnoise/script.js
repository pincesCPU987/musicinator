class APU {
	constructor() {
  	this.ctx = new AudioContext();
    
  	this.rom = new Uint16Array(64 * 1024);
    
    this.registers = new Uint16Array(16);
    
    this.m = 0;
    
    this.pc = 0;
    
    this.ac = 0;
    
    this.i = 0;
    this.z = 0;
    
    this.unjmp = 0;
    
    this.channels = [];
    
    var osc, gain;
    
    osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 440;
    gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.value = 0;
    this.channels.push({
    	vol: 0,
      newVol: 0,
      freq: 440,
      newFreq: 440,
      osc: osc,
      gain: gain
    });
    
    osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 440;
    gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.value = 0;
    this.channels.push({
    	vol: 0,
      newVol: 0,
      freq: 440,
      newFreq: 440,
      osc: osc,
      gain: gain
    });
    
    osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 440;
    gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.value = 0;
    this.channels.push({
    	vol: 0,
      newVol: 0,
      freq: 440,
      newFreq: 440,
      osc: osc,
      gain: gain
    });
    
    var targetSampleRate = 440;
    
    var buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate/targetSampleRate) * targetSampleRate, this.ctx.sampleRate);
    
    var data = buffer.getChannelData(0);
    var currentSample = 0;
    
    var framecounter = 0;
    for (var i = 0; i < data.length; i++) {
      if (framecounter == Math.round(this.ctx.sampleRate/targetSampleRate)) {
        currentSample = (Math.random() * 2) - 1;
        framecounter = 0;
      }
      data[i] = currentSample;
      framecounter++;
    }
    
    var osc = this.ctx.createBufferSource();
    osc.loop = true;
    osc.buffer = buffer;
    gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.value = 0;
    this.channels.push({
    	vol: 0,
      newVol: 0,
      freq: 440,
      newFreq: 440,
      osc: osc,
      gain: gain
    });
    
    for (var i = 0; i < this.channels.length; i++) {
    	this.channels[i].osc.start();
    }
  }
  async executeInstruction() {
  	this.i = this.rom[this.pc];
    var jumps = 1;
    switch (this.i & 0xff) {
    	case 0x00: {
      	for (var i = 0; i < this.channels.length; i++) {
          if (this.channels[i].freq != this.channels[i].newFreq) {
          	if (i < 3) {
            	this.channels[i].osc.frequency.value = this.channels[i].newFreq;
              this.channels[i].freq = this.channels[i].newFreq;
            } else {
            	var targetSampleRate = this.channels[i].newFreq;
              this.channels[i].freq = this.channels[i].newFreq;
              var buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate/targetSampleRate) * targetSampleRate, this.ctx.sampleRate);
							
              var data = buffer.getChannelData(0);
              var currentSample = 0;
							
              var framecounter = 0;
              for (var z = 0; z < data.length; z++) {
                if (framecounter == Math.round(this.ctx.sampleRate/targetSampleRate)) {
                  currentSample = (Math.random() * 2) - 1;
                  framecounter = 0;
                }
                data[z] = currentSample;
                framecounter++;
              }
              var osc = this.ctx.createBufferSource();
              osc.loop = true;
              osc.buffer = buffer;
              osc.connect(this.channels[i].gain);
              this.channels[i].osc.stop();
              osc.start();
              this.channels[i].osc = osc;
            }
          }
          if (this.channels[i].vol != this.channels[i].newVol) {
          	this.channels[i].gain.gain.value = this.channels[i].newVol / 0xffff;
            this.channels[i].vol = this.channels[i].newVol;
          }
        }
        await new Promise((rs, rj) => {requestAnimationFrame(rs);});
        break;
      }
      case 0x08: {
      	this.pc = this.unjmp;
        jumps = 0;
        break;
      }
      case 0x0f: {
      	this.unjmp = this.pc + 1;
        this.pc = this.m;
        jumps = 0;
        break;
      }
      
      
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x17: case 0x18: case 0x19: case 0x1a: case 0x1b: case 0x1c: case 0x1d: case 0x1e: case 0x1f: {
      	this.ac = this.registers[this.i & 0xf];
        break;
      }
      
      
      case 0x20: case 0x21: case 0x22: case 0x23: case 0x24: case 0x25: case 0x26: case 0x27: case 0x28: case 0x29: case 0x2a: case 0x2b: case 0x2c: case 0x2d: case 0x2e: case 0x2f: {
      	this.z = this.rom[this.pc + 1];
        this.registers[this.i & 0xf] = this.z;
        jumps = 2;
        break;
      }
      
      
      case 0x30: case 0x31: case 0x32: case 0x33: case 0x34: case 0x35: case 0x36: case 0x37: case 0x38: case 0x39: case 0x3a: case 0x3b: case 0x3c: case 0x3d: case 0x3e: case 0x3f: {
        this.registers[this.i & 0xf] = this.ac;
        break;
      }
      
      
      case 0x40: {
      	this.ac = this.rom[this.m];
        break;
      }
      case 0x41: {
      	this.z = this.rom[this.pc + 1];
        this.ac = this.z;
        jumps = 2;
        break;
      }
      case 0x48: {
      	this.m = this.ac;
        break;
      }
      case 0x49: {
      	this.z = this.rom[this.pc + 1];
        this.m = this.z;
        jumps = 2;
        break;
      }
      
      
      case 0x50: {
      	this.z = this.rom[this.pc + 1];
        if (this.ac == this.z) {
        	this.pc = this.m;
          jumps = 0;
        } else {
        	jumps = 2;
        }
        break;
      }
      case 0x51: {
      	this.z = this.rom[this.pc + 1];
        if (this.ac != this.z) {
        	this.pc = this.m;
          jumps = 0;
        } else {
        	jumps = 2;
        }
        break;
      }
      case 0x52: {
      	this.z = this.rom[this.pc + 1];
        if (this.ac < this.z) {
        	this.pc = this.m;
          jumps = 0;
        } else {
        	jumps = 2;
        }
        break;
      }
      case 0x53: {
      	this.z = this.rom[this.pc + 1];
        if (this.ac <= this.z) {
        	this.pc = this.m;
          jumps = 0;
        } else {
        	jumps = 2;
        }
        break;
      }
      case 0x54: {
      	this.z = this.rom[this.pc + 1];
        if (this.ac > this.z) {
        	this.pc = this.m;
          jumps = 0;
        } else {
        	jumps = 2;
        }
        break;
      }
      case 0x55: {
      	this.z = this.rom[this.pc + 1];
        if (this.ac >= this.z) {
        	this.pc = this.m;
          jumps = 0;
        } else {
        	jumps = 2;
        }
        break;
      }
      
      
      case 0x60: {
      	this.z = this.rom[this.pc + 1];
        this.ac += this.z;
        while (this.ac > 0xffff) {
        	this.ac -= 0x10000;
        }
        jumps = 2;
        break;
      }
      case 0x61: {
      	this.z = this.rom[this.pc + 1];
        this.ac -= this.z;
        while (this.ac < 0) {
        	this.ac += 0x10000;
        }
        jumps = 2;
        break;
      }
      case 0x64: {
      	this.z = this.rom[this.pc + 1];
        this.ac >>= this.z;
        while (this.ac < 0) {
        	this.ac += 0x10000;
        }
        while (this.ac > 0xffff) {
        	this.ac -= 0x10000;
        }
        jumps = 2;
        break;
      }
      case 0x65: {
      	this.z = this.rom[this.pc + 1];
        this.ac <<= this.z;
        while (this.ac < 0) {
        	this.ac += 0x10000;
        }
        while (this.ac > 0xffff) {
        	this.ac -= 0x10000;
        }
        jumps = 2;
        break;
      }
      case 0x68: {
      	this.z = this.rom[this.pc + 1];
        this.ac &= this.z;
        jumps = 2;
        break;
      }
      case 0x69: {
      	this.z = this.rom[this.pc + 1];
        this.ac |= this.z;
        jumps = 2;
        break;
      }
      case 0x6a: {
      	this.z = this.rom[this.pc + 1];
        this.ac ^= this.z;
        jumps = 2;
        break;
      }
      case 0x6c: {
      	this.z = this.rom[this.pc + 1];
        this.ac = ~this.ac;
        jumps = 2;
        break;
      }
      
      
      case 0x70: {
      	this.ac += this.rom[this.m];
        while (this.ac > 0xffff) {
        	this.ac -= 0x10000;
        }
        break;
      }
      case 0x71: {
      	this.ac += this.rom[this.m];
        while (this.ac < 0) {
        	this.ac += 0x10000;
        }
        break;
      }
      case 0x74: {
      	this.ac >>= this.rom[this.m];
        while (this.ac < 0) {
        	this.ac += 0x10000;
        }
        while (this.ac > 0xffff) {
        	this.ac -= 0x10000;
        }
        break;
      }
      case 0x75: {
      	this.ac <<= this.rom[this.m];
        while (this.ac < 0) {
        	this.ac += 0x10000;
        }
        while (this.ac > 0xffff) {
        	this.ac -= 0x10000;
        }
        break;
      }
      case 0x76: {
      	this.ac &= this.rom[this.m];
        break;
      }
      case 0x77: {
      	this.ac |= this.rom[this.m];
        break;
      }
      case 0x78: {
      	this.ac ^= this.rom[this.m];
        break;
      }
      
      
      case 0x80: {
      	this.channels[0].newFreq = this.ac;
        break;
      }
      case 0x81: {
      	this.channels[0].newVol = this.ac;
        break;
      }
      case 0x84: {
      	this.channels[1].newFreq = this.ac;
        break;
      }
      case 0x85: {
      	this.channels[1].newVol = this.ac;
        break;
      }
      case 0x88: {
      	this.channels[2].newFreq = this.ac;
        break;
      }
      case 0x89: {
      	this.channels[2].newVol = this.ac;
        break;
      }
      case 0x8c: {
      	this.channels[3].newFreq = this.ac;
        break;
      }
      case 0x8d: {
      	this.channels[3].newVol = this.ac;
        break;
      }
      
      
      default: {
				throw new Error(`No such instruction: 0x${this.i.toString(16).padStart(4, '0')}
at pc: 0x${this.pc.toString(16).padStart(4, '0')}`);
      }
    }
    this.pc += jumps;
    
    while (this.pc > 0xffff) {
    	this.pc -= 0x10000;
    }
    
    
    var values = document.querySelector('#values');
    
    values.querySelector('#pc').innerText = `0x${this.pc.toString(16).padStart(4, '0')}`;
    values.querySelector('#i').innerText = `0x${this.i.toString(16).padStart(4, '0')}`;
    values.querySelector('#ac').innerText = `0x${this.ac.toString(16).padStart(4, '0')}`;
    values.querySelector('#m').innerText = `0x${this.m.toString(16).padStart(4, '0')}`;
    values.querySelector('#z').innerText = `0x${this.z.toString(16).padStart(4, '0')}`;
    
    var channels = values.querySelector('#channels');
    
    channels.innerHTML = '';
    
    var tr;
    tr = document.createElement('tr');
    channels.appendChild(tr);
    
    var blank = document.createElement('th');
    blank.classList.add('cornercell');
    tr.appendChild(blank);
    
    var channelnames = ['Square A', 'Square B', 'Triangle', 'Noise'];
    
    for (var i = 0; i < this.channels.length; i++) {
    	var th = document.createElement('th');
      th.innerHTML = channelnames[i];
      th.classList.add('fullborder');
      tr.appendChild(th);
    }
    
    
    tr = document.createElement('tr');
    channels.appendChild(tr);
    
    var head = document.createElement('th');
    head.classList.add('fullborder');
    head.innerText = 'Frequency';
    tr.appendChild(head);
    for (var i = 0; i < this.channels.length; i++) {
    	var td = document.createElement('td');
      td.innerHTML = `0x${this.channels[i].freq.toString(16).padStart(4, '0')}`;
      td.classList.add('fullborder');
      td.classList.add('value');
      tr.appendChild(td);
    }
    
    
    tr = document.createElement('tr');
    channels.appendChild(tr);
    
    var head = document.createElement('th');
    head.classList.add('fullborder');
    head.innerText = 'Gain';
    tr.appendChild(head);
    for (var i = 0; i < this.channels.length; i++) {
    	var td = document.createElement('td');
      td.innerHTML = `0x${this.channels[i].vol.toString(16).padStart(4, '0')}`;
      td.classList.add('fullborder');
      td.classList.add('value');
      tr.appendChild(td);
    }
    
    
    
    var registers = values.querySelector('#registers');
    registers.innerHTML = '';
    
    var tr;
    tr = document.createElement('tr');
    registers.appendChild(tr);
    
    var blank = document.createElement('th');
    blank.classList.add('cornercell');
    tr.appendChild(blank);
    
    for (var i = 0; i < this.registers.length; i++) {
    	var th = document.createElement('th');
      th.innerHTML = `0x${i.toString(16)}`;
      th.classList.add('fullborder');
      th.classList.add('value');
      tr.appendChild(th);
    }
    
    
    tr = document.createElement('tr');
    registers.appendChild(tr);
    
    var head = document.createElement('th');
    head.classList.add('fullborder');
    head.innerText = 'Value';
    tr.appendChild(head);
    
    for (var i = 0; i < this.registers.length; i++) {
    	var td = document.createElement('td');
      td.innerHTML = `0x${this.registers[i].toString(16).padStart(4, '0')}`;
      td.classList.add('fullborder');
      td.classList.add('value');
      tr.appendChild(td);
    }
    
    
    
    var rom = values.querySelector('#rom');
    rom.innerHTML = '';
    var tr;
    
    values.querySelector('#start').innerText = `0x${(this.pc - (this.pc % 64)).toString(16).padStart(4, '0')}`;
    values.querySelector('#end').innerText = `0x${((this.pc - (this.pc % 64)) + 63).toString(16).padStart(4, '0')}`;
    
    for (var i = (this.pc - (this.pc % 64)); i < (this.pc - (this.pc % 64)) + 64; i++) {
    	if (i > 0xffff) {
      	break;
      }
      if (i % 16 == 0) {
      	tr = document.createElement('tr');
        rom.appendChild(tr);
        var th = document.createElement('th');
        th.innerText = `0x${(i - (i % 16)).toString(16).padStart(4, '0')}`;
        th.classList.add('rightborder');
        th.classList.add('value');
        tr.appendChild(th);
      }
      var td = document.createElement('td');
      tr.appendChild(td);
      td.innerText = `0x${this.rom[i].toString(16).padStart(4, '0')}`;
      td.classList.add('value');
      if (i % 8 == 7) {
      	td.classList.add('rightborder');
      } else {
      	td.classList.add('noborder');
      }
      if (i == this.pc) {
      	td.classList.add('highlight');
      }
    }
  }
  reset() {
    for (var i = 0; i < this.channels.length; i++) {
      this.channels[i].newVol = 0;
      this.channels[i].newFreq = 440;
      
      if (this.channels[i].freq != this.channels[i].newFreq) {
        if (i < 3) {
          this.channels[i].osc.frequency.value = this.channels[i].newFreq;
          this.channels[i].freq = this.channels[i].newFreq;
        } else {
          var targetSampleRate = this.channels[i].newFreq;
          this.channels[i].freq = this.channels[i].newFreq;
          var buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate/targetSampleRate) * targetSampleRate, this.ctx.sampleRate);

          var data = buffer.getChannelData(0);
          var currentSample = 0;

          var framecounter = 0;
          for (var z = 0; z < data.length; z++) {
            if (framecounter == Math.round(this.ctx.sampleRate/targetSampleRate)) {
              currentSample = (Math.random() * 2) - 1;
              framecounter = 0;
            }
            data[z] = currentSample;
            framecounter++;
          }
          var osc = this.ctx.createBufferSource();
          osc.loop = true;
          osc.buffer = buffer;
          osc.connect(this.channels[i].gain);
          this.channels[i].osc.stop();
          osc.start();
          this.channels[i].osc = osc;
        }
      }
      
      if (this.channels[i].vol != this.channels[i].newVol) {
        this.channels[i].gain.gain.value = this.channels[i].newVol / 0xffff;
        this.channels[i].vol = this.channels[i].newVol;
      }
    }
        
    for (var i = 0; i < this.registers.length; i++) {
    	this.registers[i] = 0;
    }
    
    this.ac = 0;
    this.m = 0;
    this.pc = 0;
    this.i = 0;
    this.z = 0;
  }
}

/*
var data = [
	
];

for (var i = 0; i < data.length; i++) {
	comp.rom[i] = data[i];
}
*/

async function run() {
	await comp.reset();
  document.querySelector('#click2start').style.display = 'none';
  document.querySelector('#values').style.display = 'block';
	while (running) {
  	await comp.executeInstruction().catch((e) => {
      document.querySelector('#error').style.display = 'block';
      document.querySelector('#errordetails').innerText = e.message;
      running = false;
    });
    if (document.querySelector('#slowmo').checked) {
      document.querySelector('#slowmosliderspan').style.display = 'inline';
      document.querySelector('#slowmoslidervalue').innerText = document.querySelector('#slowmoslider').value;
      await new Promise((rs, rj) => {setTimeout(rs, Number(document.querySelector('#slowmoslider').value));});
    } else {
    	document.querySelector('#slowmosliderspan').style.display = 'none';
    }
  }
}

var input = document.querySelector('#input');
var running = false;
input.onchange = (e) => {
  var file = input.files[0];
  var fr = new FileReader();
  
  fr.onload = async (e) => {
  	var result = new Uint8Array(e.target.result);
    if (result.length != 131072) {
    	alert(`File size must be exactly 131072 bytes. File uploaded is ${result.length} bytes.`);
      return;
    }
    
    running = false;
  	await new Promise((rs, rj) => {setTimeout(rs, 1/30)});
    
   	for (var i = 0; i < comp.rom.length; i++) {
    	comp.rom[i] = result[i * 2] + (result[(i * 2) + 1] << 8);
    }
    await new Promise((rs, rj) => {setTimeout(rs, 1000)});
    running = true;
    run();
  }
  
  fr.readAsArrayBuffer(file);
}

var codeinput = document.querySelector('#code');

codeinput.onkeydown = async (e) => {
	if (e.code == 'Enter' && e.ctrlKey) {
    var lines = codeinput.value.split('\n');
    /*
    Split the lines by a semicolon.
    Take the first item in the line and put it into a new string.
    Split the new string by a comma.
    Trim each value of whitespace.
    Parse each value as a number.
    Replace data in the rom.
    */
    for (var i = 0; i < lines.length; i++) {
    	lines[i] = lines[i].split(';');
      lines[i] = lines[i][0];
    }
    
    lines = lines.join('').split(',');
    for (var i = 0; i < lines.length; i++) {
    	lines[i] = lines[i].trim();
      if (isNaN(Number(lines[i]))) {
      	alert(`'${lines[i]}' cannot be parsed as a number.`);
        return;
      }
      
      lines[i] = Number(lines[i]);
      if (lines[i] < 0) {
      	alert(`${lines[i]} is less than 0 (16-bit unsigned integers only).`);
        return;
      }
      if (lines[i] > 0xffff) {
      	alert(`lines[i] is greater than 65536 (16-bit unsigned integers only).`);
        return;
      }
    }
    running = false;
    await new Promise((rs, rj) => {setTimeout(rs, 1/30);});
    comp.reset();
    
    for (var i = 0; i < comp.rom.length; i++) {
    	if (i < lines.length) {
      	comp.rom[i] = lines[i];
      } else {
      	comp.rom[i] = 0;
      }
    }
    
    await new Promise((rs, rj) => {setTimeout(rs, 1000);});
    
    running = true;
    run();
  }
}

var comp;

document.querySelector('#load').onclick = (e) => {
	comp = new APU();
  document.querySelector('#content').style.display = 'block';
  e.target.style.display = 'none';
}


function getHexValues() {
	var output = '';
  for (var i = 0; i < comp.rom.length; i++) {
  	output += comp.rom[i].toString(16).padStart(4, '0')[2] + comp.rom[i].toString(16).padStart(4, '0')[3] + comp.rom[i].toString(16).padStart(4, '0')[0] + comp.rom[i].toString(16).padStart(4, '0')[1];
  }
  console.log(output);
}
