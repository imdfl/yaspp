
function saveCSSProperties(root, {
	props, classes
}) {
	const savedProps = {};
	const add = classes?.add?.filter(cls => !root.classList.contains(cls)) ?? [];
	const remove = classes?.remove?.filter(cls => root.classList.contains(cls)) ?? [];
	if (props) {
		Object.entries(props).forEach(([key, value]) => {
			savedProps[key] = root.style.getPropertyValue(key);
			if (value !== null) {
				root.style.setProperty(key, value);
			}
		})
	}
	add.forEach(cls => {
		root.classList.add(cls);
	});
	remove.forEach(cls => {
		root.classList.remove(cls);
	});

	const reset = () => {
		// console.log("resetting props for", root, "add", add, "remove", remove, "props", savedProps)
		Object.entries(savedProps).forEach(([key, value]) => {
			// console.log(`Resetting prop ${key} to ${value} (${typeof value })`);
			if (value) {
				root.style.setProperty(key, value);
			}
			else {
				root.style.removeProperty(key);
			}
		});
		remove.forEach(cls => root.classList.add(cls));
		add.forEach(cls => root.classList.remove(cls));
	}
	return reset;
}


function getTopLeft(el) {
	const cs = window.getComputedStyle(el);
	return {
		top: parseInt(cs.getPropertyValue("top")) || 0,
		left: parseInt(cs.getPropertyValue("left")) || 0
	};
}

function positionWithoutMargin(el) {
	const rect = el.getBoundingClientRect();
	el.style.setProperty("margin", "0");
	const postRect = el.getBoundingClientRect();
	const { top, left } = getTopLeft(el);
	const newTop = Math.round(rect.y - postRect.y + top);
	const newLeft = Math.round(rect.x - postRect.x + left);
	el.style.setProperty("top", newTop ? `${newTop}px` : "0");
	el.style.setProperty("left", newLeft ? `${newLeft}px` : "0");
	// console.log("pre rect", rect, "post rect", postRect);

}

function run() {
	const dlg = document.getElementById("modal");
	const btn = document.getElementById("show-modal");
	const toolbar = dlg.querySelector(".toolbar");
	const content = dlg.querySelector(".content");

	btn.addEventListener("click", function () {
		const reset = saveCSSProperties(dlg, {
			props: {
				transform: null,
				top: null,
				left: null,
				margin: null
			}
		})
		dlg.showModal();
		dlg.addEventListener("close", () => {
			console.log("dialog closing");
			reset();
		}, { once: true })

	});
	dlg.querySelector(".close").addEventListener("click", () => {
		dlg.close();
	})

	// toolbar.addEventListener("drag", event => {
	// 	console.log(event);
	// })

	toolbar.addEventListener("dragstart", evt => {
		console.log("drag start");
		evt.preventDefault();
		evt.stopPropagation();

		// console.log("drag start at", evt);
		positionWithoutMargin(dlg);
		const resets = [
			saveCSSProperties(toolbar, {
				classes: {
					add: ["dragging", "toolbar"]
				}
			}),
			saveCSSProperties(content, {
				props: {
					userSelect: "none"
				}

			}),
			saveCSSProperties(dlg, {
				props: {
					transform: null
				}

			})
		]

		const curX = evt.clientX, curY = evt.clientY;
		let lastDX = null,
			lastDY = null;

		const trackMouse = (event) => {
			lastDX = event.clientX - curX;
			lastDY = event.clientY - curY;
			dlg.style.transform = `translate(${lastDX}px, ${lastDY}px)`
			// dlg.style.top = `${top + dy}px`;
			// dlg.style.left = `${left + dx}px`;
			// event.preventDefault();
			// event.stopImmediatePropagation();
			// console.log(position);
		}

		const stopTracking = () => {
			// console.trace("stop tracking");
			window.document.removeEventListener("mousemove", trackMouse);
			// const rect = dlg.getBoundingClientRect();
			resets.forEach(reset => reset());
			// const postRect = dlg.getBoundingClientRect();
			// console.log("pre rect", rect, "post rect", postRect);
			if (lastDX !== null) {
				const { top, left } = getTopLeft(dlg);
				dlg.style.top = `${top + lastDY}px`;
				dlg.style.left = `${left + lastDX}px`;
			}
		}

		window.document.addEventListener("mousemove", trackMouse);


		window.document.addEventListener("mouseup", () => {
			stopTracking();
			console.log("drag end")
		}, { once: true });



	});

	toolbar.addEventListener("dragend", evt => {
		console.log("drag ended");
	});

	// toolbar.addEventListener("drag", evt => {
	// 	console.log("dragging", evt);
	// });

	// toolbar.addEventListener("mousedown1", function (evt) {
	// 	console.log("mouse down");
	// 	const curX = evt.clientX,
	// 		curY = evt.clientY;
	// 	const c = window.getComputedStyle(dlg);
	// 	const top = parseInt(c.getPropertyValue("top")),
	// 		left = parseInt(c.getPropertyValue("left"));
	// 	let started = false;
	// 	// console.log("mouse down, top", top, "left", left);
	// 	function trackMouse(event) {
	// 		const dx = event.clientX - curX,
	// 			dy = event.clientY - curY;
	// 		if (!started) {
	// 			if (Math.abs(dx) + Math.abs(dy) <= 10) {
	// 				return;
	// 			}
	// 			content.style.userSelect = "none";
	// 			started = true;
	// 		}
	// 		toolbar.classList.add("dragging");
	// 		dlg.style.transform = `translate(${dx}px, ${dy}px)`
	// 		// dlg.style.top = `${top + dy}px`;
	// 		// dlg.style.left = `${left + dx}px`;
	// 		event.preventDefault();
	// 		event.stopImmediatePropagation();
	// 		// console.log(position);
	// 	}

	// 	function stopTracking() {
	// 		// console.trace("stop tracking");
	// 		toolbar.classList.remove("dragging");
	// 		window.document.removeEventListener("mousemove", trackMouse);
	// 	}

	// 	window.document.addEventListener("mousemove", trackMouse);
	// 	window.document.addEventListener("mouseup", stopTracking, {
	// 		once: true
	// 	});
	// });

}


window.addEventListener("load", run);