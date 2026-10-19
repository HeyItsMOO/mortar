package dotnetstack

import "testing"

func TestBlamesReadsEachRuntimesFrameFormat(t *testing.T) {
	cases := []struct {
		name, log string
		notMod    map[string]bool
		ns        string
		frame     string
	}{
		{"BepInEx Unity Log", `[Info   :   BepInEx] Loading [Host Fixes 1.0.28]
[Error  : Unity Log] NullReferenceException: Object reference not set to an instance of an object
Stack trace:
GameNetcodeStuff.PlayerControllerB.Update () (at <9e2a4c3b>:0)
HostFixes.Plugin+Patches.Fix (GameNetcodeStuff.PlayerControllerB __instance) (at <474744d6>:0)
UnityEngine.SendMouseEvents:DoSendMouseEvents(Int32)
`, Unity, "HostFixes", "HostFixes.Plugin+Patches.Fix (GameNetcodeStuff.PlayerControllerB __instance)"},
		{"Mono Player.log", `NullReferenceException: Object reference not set to an instance of an object
  at UnityEngine.GameObject.GetComponent[T] () [0x00000] in <abc>:0
  at CoolMod.Behaviours.Spawner.Awake () [0x0001f] in <def>:0
  at BepInEx.Bootstrap.Chainloader.Start () [0x00000] in <ghi>:0
`, Unity, "CoolMod.Behaviours", "at CoolMod.Behaviours.Spawner.Awake ()"},
		{"MelonLoader", `[12:01:02.345] [ERROR] System.InvalidOperationException: Sequence contains no elements
   at System.Linq.Enumerable.First[TSource](IEnumerable`+"`1"+` source)
   at BetterHands.Core.OnUpdate() in C:\src\Core.cs:line 41
   at MelonLoader.MelonBase.OnUpdate()
`, Unity, "BetterHands", "at BetterHands.Core.OnUpdate()"},
		{"Vintage Story crash report", `4.10.2026 19:20:01 [Fatal] Caught unhandled exception in thread 'Main'
System.NullReferenceException: Object reference not set to an instance of an object.
   at Vintagestory.API.Common.Block.GetDrops(IWorldAccessor world)
   at primitivesurvival.BlockFishBasket.OnBlockInteractStart(IWorldAccessor world) in /src/Block.cs:line 88
   at Vintagestory.Client.NoObf.ClientMain.Run()
`, VintageStory, "primitivesurvival", "at primitivesurvival.BlockFishBasket.OnBlockInteractStart(IWorldAccessor world)"},
	}
	for _, c := range cases {
		got := Blames(c.log, c.notMod)
		if len(got) != 1 || got[0].Namespace != c.ns || got[0].Frame != c.frame && got[0].Frame != "at "+c.frame {
			t.Errorf("%s: got %+v, want namespace %q frame %q", c.name, got, c.ns, c.frame)
		}
	}
}

func TestBlamesIgnoresStacksWithoutAModFrame(t *testing.T) {
	log := "NullReferenceException: x\nStack trace:\nUnityEngine.GameObject.Find (System.String name) (at <a>:0)\nTMPro.TMP_Text.Update () (at <b>:0)\n"
	if got := Blames(log, Unity); len(got) != 0 {
		t.Fatalf("got %+v", got)
	}
}
