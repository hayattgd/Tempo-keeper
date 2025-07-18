const bpmtext = document.querySelector("h2");
const button = document.querySelector("button");
const stick = document.getElementById("stick");
const accuracytext = document.getElementById("accuracy");
// const ms = document.getElementById("ms");

const audioCtx = new AudioContext();

let BPM = 120;
let lastBeat = 0;
let judgeBeat = 0;

let lastPress = 0;
let lastPressedBeat = 0;

let currentBeat = 0;
let Beatadjusted = false;

let silencefrom = 0;

let totalaccuracy = 0;
let accuracycount = 0;

let isStarted = false;

let swingLeft = false;

function GetIntervalFromBPM(bpm)
{
	return 60 / bpm
}

function tick()
{
	if (!isStarted) { return }

	const now = performance.now();
	const msinterval = GetIntervalFromBPM(BPM) * 1000;

	if (now - lastBeat >= msinterval)
	{
		Beatadjusted = false;
		lastBeat += msinterval;
		judgeBeat -= msinterval;
		beat();
	}

	if (now - lastBeat >= msinterval / 2 && !Beatadjusted)
	{
		Beatadjusted = true
		currentBeat += 1;
		judgeBeat += msinterval;
		// bpmtext.innerHTML = currentBeat;
	}
}

function beat()
{
	const now = performance.now();
	if (now - silencefrom > 0 && now - (silencefrom + 5000) < 0)
	{
		//Silence mode
		accuracytext.style.transition = "0.5s";
		accuracytext.style.color = "gray";

		document.querySelector("body").style.transition = "0.5  s";
		document.querySelector("body").style.backgroundColor = "gray";
		//Swing stick
		const angle = swingLeft ? -25 : 25;
		stick.style.transform = `rotate(${angle}deg)`;
		stick.style.transition = `transform 1s ease-in-out`
		swingLeft = !swingLeft;
	}
	else
	{
		accuracytext.style.color = "";
		document.querySelector("body").style.backgroundColor = "";
		//Play sound
		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.type = 'square';
		osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
		gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
		osc.connect(gain);
		gain.connect(audioCtx.destination);
		osc.start();
		osc.stop(audioCtx.currentTime + 0.05);

		//Swing stick
		const angle = swingLeft ? -25 : 25;
		stick.style.transform = `rotate(${angle}deg)`;
		stick.style.transition = `transform ${GetIntervalFromBPM(BPM) - 0.02}s ease-in-out`
		swingLeft = !swingLeft;
	}
}

function action()
{
	let now = performance.now();

	if (isStarted)
	{
		now -= 70; //adjust for some delays

		if (now - lastPress < 42)
		{
			alert("(´•ω•`)");
			// alert(now - lastPress);
			isStarted = false;
		}

		lastPress = now;

		if (lastPressedBeat == currentBeat) { return }

		lastPressedBeat = currentBeat;
		const msinterval = GetIntervalFromBPM(BPM) * 1000;
		const diff = now - (lastBeat + judgeBeat);

		// ms.innerHTML = `${diff}ms`

		if (now - silencefrom > 0 && now - (silencefrom + 5000) < 0)
		{
			const accuracy = 1 - Math.abs(diff) / msinterval;
			totalaccuracy += accuracy;
			accuracycount += 1;

			accuracytext.innerHTML = `${((totalaccuracy / accuracycount * 100 - 50) * 2).toFixed(1)}%`;
		}
		// scoretext.innerHTML = 1 - Math.abs(diff) / (msinterval / 2);
	}
	else
	{
		isStarted = true;
		accuracytext.innerHTML = "100.0%";

		const MAX_BPM = 160;
		const MIN_BPM = 60;

		silencefrom = now + 10000;
		BPM = Math.floor(Math.random() * (MAX_BPM - MIN_BPM + 1)) + MIN_BPM;
		// BPM = MAX_BPM;
		bpmtext.innerHTML = "BPM : " + BPM;

		totalaccuracy = 0;
		accuracycount = 0;

		button.innerHTML = "Tap";
		lastBeat = now;
		beat();
	}
}

button.onmousedown = action;
window.addEventListener('keydown', action);

setInterval(() => {
	tick();
}, 3);