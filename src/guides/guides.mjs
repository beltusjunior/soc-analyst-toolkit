const nun = (color, num) => `<svg viewBox="0 0 46 64" aria-hidden="true"><path d="M23 4L40 44H6z" fill="var(${color})"/><rect x="4" y="44" width="38" height="6" fill="var(--navy-2)"/><text x="23" y="38" text-anchor="middle" font-family="monospace" font-size="12" fill="#fff">${num}</text></svg>`;
const can = (color, num) => `<svg viewBox="0 0 46 64" aria-hidden="true"><rect x="8" y="10" width="30" height="34" fill="var(${color})"/><rect x="4" y="44" width="38" height="6" fill="var(--navy-2)"/><text x="23" y="34" text-anchor="middle" font-family="monospace" font-size="12" fill="#fff">${num}</text></svg>`;

export default [
{
slug: "red-right-returning",
title: "Red, Right, Returning: Buoys and Channel Markers Explained",
description: "How to read lateral markers so you always know which side of the channel to stay on.",
minutes: 5, updated: "2026-11-02",
body: `
<p>Lateral markers show the edges of a safe channel. Read them correctly and you stay in deep water. Read them backwards and you can run aground. The whole system rests on one phrase: <b>red, right, returning</b>.</p>
<h2>The two shapes</h2>
<div class="marks">
<div class="mark">${nun("--port", "2")}<div><b>Red nun</b><span class="note">Cone-shaped top, even numbers. Keep it on your right when returning from sea.</span></div></div>
<div class="mark">${can("--star", "1")}<div><b>Green can</b><span class="note">Flat top, odd numbers. Keep it on your left when returning from sea.</span></div></div>
</div>
<h2>What counts as returning?</h2>
<p>Returning means heading from open water toward a harbor, or traveling upstream on a river. Marker numbers increase as you return. Heading out to sea, flip the rule: red stays on your left.</p>
<h2>Lights on markers</h2>
<p>Lighted red markers show red lights, and lighted green markers show green lights, so the same rule works at night.</p>
<h2>Other markers you will see</h2>
<ul>
<li><b>Red-and-green banded markers</b> show where a channel splits. The top color tells you the preferred channel.</li>
<li><b>White markers with orange shapes</b> are regulatory: a diamond warns of danger, a diamond with a cross means boats keep out, and a circle marks a controlled area such as a no-wake zone.</li>
</ul>
<div class="callout"><b>Exam tip:</b> if a question describes a boat heading upstream or into port, red goes on the starboard (right) side.</div>
<p>Questions 6 and 7 in the <a href="/practice-test/">free practice test</a> cover this.</p>`
},
{
slug: "boat-navigation-lights",
title: "Boat Navigation Lights: What Each Light Means",
description: "Sidelights, sternlights and masthead lights, when to show them, and how to read another boat's lights at night.",
minutes: 6, updated: "2026-11-02",
body: `
<p>Navigation lights tell other boaters what kind of vessel you are and which way you are heading. They are required from sunset to sunrise and whenever visibility is reduced, such as in fog or heavy rain.</p>
<h2>The main lights on a powerboat</h2>
<div class="tablewrap"><table>
<tr><th>Light</th><th>Color</th><th>Where it shows</th></tr>
<tr><td>Sidelights</td><td>Red (port) and green (starboard)</td><td>Visible from ahead and each side</td></tr>
<tr><td>Sternlight</td><td>White</td><td>Visible from behind</td></tr>
<tr><td>Masthead light</td><td>White</td><td>Visible from ahead and both sides</td></tr>
<tr><td>All-round light</td><td>White</td><td>Visible in every direction; on small powerboats it can replace the masthead and stern lights</td></tr>
</table></div>
<h2>Reading another boat's lights</h2>
<ul>
<li><b>You see red and green together:</b> the boat is heading straight at you. Both boats should turn to starboard.</li>
<li><b>You see only red:</b> you are looking at its port side, and it is crossing from your starboard side. You are the give-way vessel: slow down or turn to pass behind it.</li>
<li><b>You see only green:</b> you are looking at its starboard side. You are usually the stand-on vessel, so hold course and speed but stay ready to act.</li>
<li><b>You see only white:</b> you are probably behind it, overtaking. The overtaking boat must keep clear.</li>
</ul>
<h2>Sailboats and paddlers</h2>
<p>A sailboat under sail alone shows sidelights and a sternlight but no masthead light. Kayaks, canoes and small rowboats need at least a white light, such as a flashlight, ready to show in time to prevent a collision.</p>
<div class="callout"><b>Memory aid:</b> think of traffic lights. A red light means stop: you give way. A green light means go: you hold your course, carefully.</div>`
},
{
slug: "who-has-the-right-of-way-on-the-water",
title: "Who Has the Right of Way on the Water?",
description: "Crossing, meeting and overtaking rules in plain English, and why no boat ever truly has the right of way.",
minutes: 5, updated: "2026-11-02",
body: `
<p>On the water there is technically no right of way. The navigation rules name a <b>give-way vessel</b>, which must take early action to keep clear, and a <b>stand-on vessel</b>, which should hold its course and speed. Both are responsible for avoiding a collision.</p>
<h2>Crossing</h2>
<p>When two powerboats cross paths, the boat on the other's starboard (right) side is the stand-on vessel. If a boat approaches from your right, you give way: slow down, stop, or turn to pass behind it.</p>
<h2>Meeting head-on</h2>
<p>When two powerboats approach head-on, neither is stand-on. Both turn to starboard and pass port side to port side.</p>
<h2>Overtaking</h2>
<p>The boat doing the overtaking is always the give-way vessel, whatever type of boat it is. The boat being passed holds its course and speed.</p>
<h2>Powerboats and sailboats</h2>
<p>In general, a powerboat gives way to a sailboat under sail, a vessel fishing with nets or trawls, and a vessel that cannot maneuver easily. A sailboat using its engine counts as a powerboat. Large ships in narrow channels cannot stop or turn quickly, so small boats should stay well clear.</p>
<div class="callout"><b>When in doubt:</b> five or more short blasts on the horn is the danger signal. Use it when you don't understand what another boat is doing.</div>
<p>Practise these rules with questions 3, 4 and 5 of the <a href="/practice-test/">free practice test</a>.</p>`
}
];
