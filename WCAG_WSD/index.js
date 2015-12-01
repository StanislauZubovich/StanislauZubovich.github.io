document.addEventListener('DOMContentLoaded', function () {
	// your code goes here

	var v = document.getElementById('oops');
	console.log(v);
	v.addEventListener('play', function () {
		v.play();
	}, false);
	v.onclick = function () {
		if (v.paused) {
			v.play();
		} else {
			v.pause();
		}
		return false;
	};
}, false);