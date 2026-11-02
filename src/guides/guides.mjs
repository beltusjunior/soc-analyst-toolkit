// Symptom guides. `tree` links each guide to its troubleshooter in src/data/trees.json.
const STOP = `<div class="callout" style="background:var(--danger-soft)"><b>Stop and call a professional if</b> you smell gas, hear a boom when the burners light, see scorch marks, or your carbon monoxide alarm goes off. If you smell gas, leave the house first and call your gas company or 911 from outside.</div>`;
const OFF = `<p><b>Before opening any panel:</b> turn the furnace off at the thermostat, then switch off its power at the service switch (it looks like a light switch on or near the furnace).</p>`;

export default [
{
slug: "furnace-blowing-cold-air", tree: "cold",
title: "Why Is My Furnace Blowing Cold Air? 6 Causes and Fixes",
description: "From a one-minute thermostat setting to a dirty flame sensor or failed igniter: the causes of cold air from your vents, ranked from most to least common.",
minutes: 8, updated: "2026-11-02",
body: `
<p>Cold air from the vents is the most common furnace complaint, and the fix is often free. Work through these causes in order. They are ranked so the quickest checks come first.</p>
<h2>1. The thermostat fan is set to ON</h2>
<p>With the fan set to ON, the blower runs all the time, including between heating cycles. The air coming out between cycles is room temperature, which feels cold on your hand.</p>
<p><b>Fix:</b> set the fan to AUTO. The blower will run only while the furnace is heating. Time: one minute.</p>
<h2>2. A clogged air filter</h2>
<p>A dirty filter chokes airflow. The heat exchanger overheats, a safety device called the high-limit switch shuts off the burners, and the blower keeps pushing unheated air until things cool down. The cycle repeats.</p>
<p><b>Fix:</b> replace the filter. Note the size printed on its edge, and point the new filter's airflow arrow toward the furnace. Check it monthly during heating season.</p>
<h2>3. A dirty flame sensor</h2>
<p>If the burners light and then shut off within a few seconds, the flame sensor probably can't detect the flame through a layer of residue. The furnace shuts off the gas as a safety measure.</p>
<p><b>Fix:</b> ${"turn off power and gas, remove the sensor (a thin metal rod held by one screw), and gently polish it with fine steel wool or a fine abrasive pad. Do not use sandpaper. If the problem returns, the sensor may need replacing."}</p>
<h2>4. The igniter or pilot isn't lighting</h2>
<p>If the burners never light at all, the igniter may have failed, the gas valve may be off, or the control board may have locked out after several failed attempts. Most furnaces flash an error code through a small window on the lower panel.</p>
<p><b>Fix:</b> make sure the gas valve beside the furnace is on (handle parallel to the pipe), count the error code blinks, and match them to the chart inside the furnace door. Igniter and gas valve replacement is a job for a technician.</p>
<h2>5. A clogged condensate line (high-efficiency furnaces)</h2>
<p>Furnaces with white PVC vent pipes produce water as they run. If the drain line or trap clogs, a safety switch stops the burners while the blower may keep running.</p>
<p><b>Fix:</b> turn off power, check the drain hose and trap for blockages, and flush them. If you have a condensate pump, make sure it runs when you lift its float.</p>
<h2>6. Leaky or disconnected ducts</h2>
<p>If the furnace is heating but some rooms stay cold, heated air may be escaping through a disconnected duct in the basement, crawlspace or attic.</p>
<p><b>Fix:</b> look for loose or separated duct joints you can reach, and seal them with metal foil tape (not cloth duct tape). Hidden duct problems need a technician.</p>
${STOP}`
},
{
slug: "furnace-not-turning-on", tree: "off",
title: "Furnace Not Turning On? Check These 5 Things First",
description: "Thermostat batteries, the power switch, the door safety switch, the filter and error codes: what to check when your furnace won't start.",
minutes: 6, updated: "2026-11-02",
body: `
<p>When a furnace won't start, the cause is usually simple. These five checks take about 15 minutes in total and solve a large share of no-heat calls.</p>
<h2>1. The thermostat</h2>
<p>A blank display usually means dead batteries. Replace them, set the mode to HEAT, and set the temperature at least 3 degrees above the room temperature. Some thermostats wait up to five minutes before calling for heat.</p>
<h2>2. The power switch and breaker</h2>
<p>Furnaces have a service switch that looks like a light switch, on or near the unit. People often turn it off by mistake. Also check the breaker in your electrical panel. If the breaker trips again right away, leave it off and call a technician.</p>
<h2>3. The blower door</h2>
<p>A safety switch cuts power when the lower front panel is not fully closed. Press the panel firmly into place until it seats.</p>
<h2>4. The air filter</h2>
<p>A badly clogged filter can make the furnace overheat and shut itself off. Replace it if it looks grey or you can't see light through it.</p>
<h2>5. The error code</h2>
<p>Look through the small window on the lower panel for a blinking light on the control board. Count the blinks and match them to the chart inside the furnace door. No light at all, with power on, can point to a failed transformer or control board fuse, which is a job for a technician.</p>
${STOP}`
},
{
slug: "furnace-leaking-water", tree: "leak",
title: "Why Is My Furnace Leaking Water?",
description: "Whether the leak happens with the AC or the heat on tells you the cause. Here's how to find it and fix it.",
minutes: 6, updated: "2026-11-02",
body: `
<p>A puddle around the furnace almost always comes from one of three places. The first clue is when it happens.</p>
<h2>Leaking while the air conditioning runs</h2>
<p>Your AC's indoor coil usually sits on top of the furnace. It drips condensation into a pan that drains through a PVC line. When that line clogs, the pan overflows and water runs down the furnace.</p>
${OFF}
<p><b>Fix:</b> find the drain line's cleanout cap and pour in a cup of distilled vinegar, or use a wet/dry vacuum on the outdoor end of the line to pull the clog out. A cracked or rusted drain pan needs a technician.</p>
<h2>Leaking while the heat runs, with white PVC vent pipes</h2>
<p>PVC vent pipes mean you have a high-efficiency condensing furnace. It produces water as part of normal operation and drains it through a trap and hose, sometimes into a small condensate pump.</p>
<p><b>Fix:</b> check for a cracked, disconnected or clogged hose and reconnect or flush it. If you have a pump, lift its float: the pump should run. Replacement pumps cost about $50 to $80.</p>
<h2>Leaking while the heat runs, with a metal flue</h2>
<p>A standard-efficiency furnace with a metal flue pipe should not produce water. Leaking can mean exhaust is cooling and condensing in a poorly sized or blocked flue, which can also let carbon monoxide into your home.</p>
<p><b>Fix:</b> test your CO alarms and schedule a technician inspection soon.</p>
${STOP}`
},
{
slug: "furnace-making-loud-noises", tree: "noise",
title: "Furnace Making Loud Noises? What Each Sound Means",
description: "Booms, squeals, rattles, scraping and whistling: what each furnace noise usually means and which ones need a professional right away.",
minutes: 6, updated: "2026-11-02",
body: `
<p>Every furnace hums, clicks and ticks a little as metal heats and cools. These sounds are different, and some of them mean you should turn the furnace off.</p>
<div class="tablewrap"><table>
<tr><th>Sound</th><th>Likely cause</th><th>What to do</th></tr>
<tr><td>Boom or bang at startup</td><td>Delayed ignition: gas builds up before it lights, often due to dirty burners</td><td><b>Turn the furnace off</b> and call a technician</td></tr>
<tr><td>Squealing or screeching</td><td>A worn blower belt or failing blower motor bearings</td><td>Replace a worn belt; motor issues need a pro</td></tr>
<tr><td>Rattling or vibrating</td><td>Loose panels, screws or duct joints</td><td>Tighten panels and duct screws</td></tr>
<tr><td>Metal scraping</td><td>A loose or broken blower wheel hitting its housing</td><td><b>Turn it off now</b> and call a technician</td></tr>
<tr><td>Whistling</td><td>Restricted airflow, often a dirty filter or closed vents</td><td>Replace the filter and open vents</td></tr>
</table></div>
<h2>Why a boom is serious</h2>
<p>Delayed ignition is a small explosion inside the furnace. Repeated booms can crack the heat exchanger, which can leak carbon monoxide. Don't keep running a furnace that booms.</p>
${STOP}`
}
];
