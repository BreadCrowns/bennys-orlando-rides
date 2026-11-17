// Complete dataset of rides at Walt Disney World Resort & Universal Orlando Resort
// Organized by Resort -> Park -> Land
// thrillBase (1-5): Locomotion of the ride itself (speed, drops, launches, inversions, motion)
// scareBase (1-5): Set dressings, lighting, darkness, spooky/intense theming, sudden startles

const PARKS_DATA = [
  {
    id: "magic-kingdom",
    name: "Magic Kingdom",
    resort: "disney",
    resortName: "Walt Disney World",
    icon: "🏰",
    color: "#2563eb",
    lands: [
      {
        name: "Main Street, U.S.A.",
        rides: [
          {
            id: "mk-wdw-railroad",
            name: "Walt Disney World Railroad",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle"],
            thrillDesc: "Smooth, slow steam train loop around the park.",
            scareDesc: "Open-air, bright daylight, cheerful scenery.",
            nudgeTip: "Super relaxing—great way to rest your feet and see the park!"
          },
          {
            id: "mk-main-street-vehicles",
            name: "Main Street Vehicles",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle"],
            thrillDesc: "Slow vintage car or horse-drawn trolley ride down Main Street.",
            scareDesc: "Bright outdoor street with music and shops.",
            nudgeTip: "Just a fun, slow cruise down Main Street."
          }
        ]
      },
      {
        name: "Adventureland",
        rides: [
          {
            id: "mk-jungle-cruise",
            name: "Jungle Cruise",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle", "water"],
            thrillDesc: "Slow, flat guided boat ride with zero drops.",
            scareDesc: "Daylight jungle with funny animatronic animals and a short, goofy temple cave.",
            nudgeTip: "The skipper tells dad jokes the whole time—nothing is meant to scare you!"
          },
          {
            id: "mk-pirates",
            name: "Pirates of the Caribbean",
            thrillBase: 2,
            scareBase: 3,
            height: "Any height",
            tags: ["dark-ride", "water", "drop", "in-the-dark"],
            thrillDesc: "Gentle boat ride with one short, fun 14-foot splash drop in the dark.",
            scareDesc: "Dimly lit caves, skeleton pirates, and loud cannon battle scenes.",
            nudgeTip: "The drop is tiny and over in 2 seconds! The skeletons are animatronics and the pirates are actually pretty goofy."
          },
          {
            id: "mk-magic-carpets",
            name: "The Magic Carpets of Aladdin",
            thrillBase: 2,
            scareBase: 1,
            height: "Any height",
            tags: ["spinning", "gentle"],
            thrillDesc: "Gentle flying spinner where you control how high your carpet goes.",
            scareDesc: "Bright, sunny marketplace (watch out for the spitting camel!).",
            nudgeTip: "You control the height lever yourself, so you're always in charge."
          }
        ]
      },
      {
        name: "Frontierland",
        rides: [
          {
            id: "mk-big-thunder",
            name: "Big Thunder Mountain Railroad",
            thrillBase: 3,
            scareBase: 2,
            height: "38\"",
            tags: ["coaster"],
            thrillDesc: "Fast, bumpy runaway mine train coaster with twists and turns, no upside-down loops.",
            scareDesc: "Mostly outdoor daylight desert canyon with a short dark bat cave at the start.",
            nudgeTip: "No big steep drops—just fast, swooping turns in the sunshine!"
          },
          {
            id: "mk-tianas-bayou",
            name: "Tiana's Bayou Adventure",
            thrillBase: 3,
            scareBase: 2,
            height: "40\"",
            tags: ["water", "drop", "dark-ride"],
            thrillDesc: "Log flume boat ride with a few small dips and one big 50-foot splashdown drop.",
            scareDesc: "Bright, colorful bayou filled with music and friendly critters.",
            nudgeTip: "Unlike old spooky log rides, this one is bright, upbeat, and celebratory all the way to the big splash!"
          }
        ]
      },
      {
        name: "Liberty Square",
        rides: [
          {
            id: "mk-haunted-mansion",
            name: "Haunted Mansion",
            thrillBase: 1,
            scareBase: 4,
            height: "Any height",
            tags: ["dark-ride", "in-the-dark"],
            thrillDesc: "Very slow, smooth moving armchair (Omnimover) with zero drops or speed.",
            scareDesc: "Dark haunted house, spooky organ music, ghosts popping up, and a graveyard.",
            nudgeTip: "The ride itself moves at walking speed with zero drops! The ghosts are silly and singing by the end."
          }
        ]
      },
      {
        name: "Fantasyland",
        rides: [
          {
            id: "mk-seven-dwarfs",
            name: "Seven Dwarfs Mine Train",
            thrillBase: 3,
            scareBase: 2,
            height: "38\"",
            tags: ["coaster"],
            thrillDesc: "Smooth, swaying family coaster with medium hills and no loops.",
            scareDesc: "Sunny forest and a sparkly jewel mine (the Witch briefly appears at the very end).",
            nudgeTip: "One of the smoothest coasters anywhere—great step up from kiddie coasters!"
          },
          {
            id: "mk-peter-pan",
            name: "Peter Pan's Flight",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["dark-ride", "gentle"],
            thrillDesc: "Slow suspended pirate ship gliding gently above miniature scenes.",
            scareDesc: "Glowing blacklight London and Neverland; Captain Hook is cartoony.",
            nudgeTip: "Feels like floating gently in the air over a glowing model city."
          },
          {
            id: "mk-small-world",
            name: "\"it's a small world\"",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle", "water"],
            thrillDesc: "Completely flat, slow indoor boat ride.",
            scareDesc: "Bright, colorful singing dolls from around the world.",
            nudgeTip: "Zero thrills and zero scares—just a catchy song!"
          },
          {
            id: "mk-winnie-the-pooh",
            name: "The Many Adventures of Winnie the Pooh",
            thrillBase: 1,
            scareBase: 2,
            height: "Any height",
            tags: ["dark-ride", "gentle"],
            thrillDesc: "Slow dark ride with a little gentle bouncing during Tigger's part.",
            scareDesc: "Mostly bright storybook pages, with one brief, trippy Heffalumps & Woozles dark room.",
            nudgeTip: "Very gentle; the brief dark dream room is silly and colorful."
          },
          {
            id: "mk-little-mermaid",
            name: "Under the Sea ~ Journey of The Little Mermaid",
            thrillBase: 1,
            scareBase: 2,
            height: "Any height",
            tags: ["dark-ride", "gentle"],
            thrillDesc: "Slow, smooth clamshell ride with zero drops.",
            scareDesc: "Colorful underwater scenes, with one brief room featuring Ursula.",
            nudgeTip: "Super smooth and upbeat—Ursula's part only lasts about 15 seconds."
          },
          {
            id: "mk-mad-tea-party",
            name: "Mad Tea Party",
            thrillBase: 2,
            scareBase: 1,
            height: "Any height",
            tags: ["spinning"],
            thrillDesc: "Spinning teacups—mild if you don't turn the center wheel, fast if you do!",
            scareDesc: "Bright pastel Wonderland party.",
            nudgeTip: "You control how fast your cup spins using the wheel in the middle."
          },
          {
            id: "mk-dumbo",
            name: "Dumbo the Flying Elephant",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["spinning", "gentle"],
            thrillDesc: "Gentle circular flight where you control your elephant's height.",
            scareDesc: "Bright, cheerful circus.",
            nudgeTip: "Classic gentle ride—you pick how high to fly."
          },
          {
            id: "mk-barnstormer",
            name: "The Barnstormer",
            thrillBase: 2,
            scareBase: 1,
            height: "35\"",
            tags: ["coaster"],
            thrillDesc: "Short, mild junior roller coaster (lasts about 1 minute).",
            scareDesc: "Bright outdoor circus backyard.",
            nudgeTip: "A quick, friendly warm-up coaster to test how you feel about coaster hills!"
          },
          {
            id: "mk-carousel",
            name: "Prince Charming Regal Carrousel",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle"],
            thrillDesc: "Classic slow-spinning horse carousel.",
            scareDesc: "Bright royal courtyard.",
            nudgeTip: "Totally chill classic carousel."
          }
        ]
      },
      {
        name: "Tomorrowland",
        rides: [
          {
            id: "mk-tron",
            name: "TRON Lightcycle / Run",
            thrillBase: 5,
            scareBase: 3,
            height: "48\"",
            tags: ["coaster", "in-the-dark"],
            thrillDesc: "High-speed 59 mph launch coaster riding forward like a motorcycle; no upside-down loops.",
            scareDesc: "Glowing neon blue/orange futuristic Grid in the dark with intense synth music.",
            nudgeTip: "Looks super intense from outside, and the launch is fast—but there are NO inversions and it's super smooth! (There's also a regular bench seat in the back row if the bike seat feels weird.)"
          },
          {
            id: "mk-space-mountain",
            name: "Space Mountain",
            thrillBase: 4,
            scareBase: 3,
            height: "44\"",
            tags: ["coaster", "in-the-dark"],
            thrillDesc: "Classic jerky indoor coaster with sudden turns and small drops; top speed is only ~27 mph.",
            scareDesc: "Pitch-black space dome with stars and glowing red tunnels.",
            nudgeTip: "Being in the dark makes it FEEL twice as fast as it really is! It's actually slower than Big Thunder Mountain and has zero loops."
          },
          {
            id: "mk-buzz-lightyear",
            name: "Buzz Lightyear's Space Ranger Spin",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["dark-ride", "interactive", "gentle"],
            thrillDesc: "Slow Omnimover ride where you can spin your cruiser 360 degrees.",
            scareDesc: "Bright neon arcade-style space targets and Emperor Zurg.",
            nudgeTip: "Feels like playing a giant laser-tag video game!"
          },
          {
            id: "mk-peoplemover",
            name: "Tomorrowland Transit Authority PeopleMover",
            thrillBase: 1,
            scareBase: 2,
            height: "Any height",
            tags: ["gentle"],
            thrillDesc: "Slow, breezy elevated tram tour around Tomorrowland.",
            scareDesc: "Mostly outdoors, with a brief dark tunnel peeking inside Space Mountain.",
            nudgeTip: "Great way to peek inside Space Mountain without riding it first!"
          },
          {
            id: "mk-astro-orbiter",
            name: "Astro Orbiter",
            thrillBase: 2,
            scareBase: 2,
            height: "Any height",
            tags: ["spinning"],
            thrillDesc: "Fast-spinning rocket spinner high up on a platform.",
            scareDesc: "High up in the open air—can feel dizzying if you don't like heights.",
            nudgeTip: "You can keep your rocket low inside the ring if heights bug you."
          },
          {
            id: "mk-speedway",
            name: "Tomorrowland Speedway",
            thrillBase: 1,
            scareBase: 1,
            height: "32\" (54\" to drive alone)",
            tags: ["gentle"],
            thrillDesc: "Slow gas-powered go-karts on a guided center track.",
            scareDesc: "Bright outdoor racetrack.",
            nudgeTip: "You get to steer and press the gas pedal yourself!"
          }
        ]
      }
    ]
  },
  {
    id: "epcot",
    name: "EPCOT",
    resort: "disney",
    resortName: "Walt Disney World",
    icon: "🌐",
    color: "#0284c7",
    lands: [
      {
        name: "World Celebration",
        rides: [
          {
            id: "ep-spaceship-earth",
            name: "Spaceship Earth",
            thrillBase: 1,
            scareBase: 2,
            height: "Any height",
            tags: ["dark-ride", "gentle"],
            thrillDesc: "Slow, gentle climb inside the giant EPCOT sphere; comes down backward slowly.",
            scareDesc: "Dimly lit history scenes with animatronics, ending in a starry space dome.",
            nudgeTip: "Totally calm and educational—the slow backward descent is just leaning back in your seat."
          },
          {
            id: "ep-figment",
            name: "Journey Into Imagination with Figment",
            thrillBase: 1,
            scareBase: 2,
            height: "Any height",
            tags: ["dark-ride", "gentle"],
            thrillDesc: "Slow, flat trackless/guided dark ride.",
            scareDesc: "Colorful, silly labs with one sudden loud puff-of-air surprise.",
            nudgeTip: "Figment is super friendly; just expect one silly skunk-smell & air puff gag!"
          }
        ]
      },
      {
        name: "World Discovery",
        rides: [
          {
            id: "ep-cosmic-rewind",
            name: "Guardians of the Galaxy: Cosmic Rewind",
            thrillBase: 4,
            scareBase: 3,
            height: "42\"",
            tags: ["coaster", "in-the-dark"],
            thrillDesc: "Ultra-smooth indoor coaster with a backward launch and cars that rotate smoothly to face the screens; no upside-down loops.",
            scareDesc: "Dark cosmic space battle with awesome 80s rock music and giant screens.",
            nudgeTip: "Looks intimidating because of the backward launch, but it is silky smooth and feels like dancing through space!"
          },
          {
            id: "ep-test-track",
            name: "Test Track",
            thrillBase: 4,
            scareBase: 2,
            height: "40\"",
            tags: ["coaster", "simulator"],
            thrillDesc: "Car test-drive with sharp turns, braking, and a 65 mph outdoor high-speed loop.",
            scareDesc: "Sleek, high-tech futuristic lab and sunny outdoor track.",
            nudgeTip: "No big drops at all—just feels like riding in a fast convertible on the highway!"
          },
          {
            id: "ep-mission-space-green",
            name: "Mission: SPACE (Green Team - Mild)",
            thrillBase: 2,
            scareBase: 2,
            height: "40\"",
            tags: ["simulator"],
            thrillDesc: "Gentle motion-simulator flight around Earth with NO spinning centrifuge.",
            scareDesc: "Tightly enclosed 4-person space capsule cockpit.",
            nudgeTip: "Green Team does NOT spin! Only skip if tight spaces bother you."
          },
          {
            id: "ep-mission-space-orange",
            name: "Mission: SPACE (Orange Team - Intense)",
            thrillBase: 5,
            scareBase: 3,
            height: "44\"",
            tags: ["simulator", "spinning"],
            thrillDesc: "Intense centrifuge spinning simulator creating real 2.5G rocket-launch forces.",
            scareDesc: "Tightly enclosed space capsule with an intense Mars crash-landing.",
            nudgeTip: "Only do Orange if you love strong G-forces and never get motion sick!"
          }
        ]
      },
      {
        name: "World Nature",
        rides: [
          {
            id: "ep-soarin",
            name: "Soarin' Around the World",
            thrillBase: 2,
            scareBase: 2,
            height: "40\"",
            tags: ["simulator"],
            thrillDesc: "Gentle hang-glider seat lifted in front of a giant curved IMAX dome.",
            scareDesc: "Bright scenic world landmarks, with a few sudden scene transitions (like a whale splash).",
            nudgeTip: "Super smooth—just feels like swinging gently while watching a giant movie."
          },
          {
            id: "ep-living-land",
            name: "Living with the Land",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle", "water"],
            thrillDesc: "Slow, flat boat cruise through real greenhouses.",
            scareDesc: "Bright daylight greenhouses and calm nature scenes.",
            nudgeTip: "Zero drops, super peaceful."
          },
          {
            id: "ep-nemo",
            name: "The Seas with Nemo & Friends",
            thrillBase: 1,
            scareBase: 2,
            height: "Any height",
            tags: ["dark-ride", "gentle"],
            thrillDesc: "Slow clamshell ride.",
            scareDesc: "Dark ocean scenes with Bruce the shark and an anglerfish briefly appearing.",
            nudgeTip: "Very gentle; the anglerfish and Bruce are quick cartoon moments."
          }
        ]
      },
      {
        name: "World Showcase",
        rides: [
          {
            id: "ep-frozen",
            name: "Frozen Ever After",
            thrillBase: 2,
            scareBase: 2,
            height: "Any height",
            tags: ["water", "dark-ride", "drop"],
            thrillDesc: "Boat ride with a short backward section and one mild, fun splash drop.",
            scareDesc: "Snowy Arendelle with Marshmallow the snow monster briefly roaring near the drop.",
            nudgeTip: "The drop is gentle and Marshmallow is actually helping you at the end!"
          },
          {
            id: "ep-remy",
            name: "Remy's Ratatouille Adventure",
            thrillBase: 2,
            scareBase: 2,
            height: "Any height",
            tags: ["dark-ride", "simulator"],
            thrillDesc: "Trackless 3D ride that darts, spins gently, and scoots across giant kitchen floors.",
            scareDesc: "Oversized French kitchen with Chef Skinner chasing you and a brief hot-oven heat effect.",
            nudgeTip: "Zero drops—just fun 3D scurrying like a little rat!"
          },
          {
            id: "ep-gran-fiesta",
            name: "Gran Fiesta Tour Starring The Three Caballeros",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle", "water"],
            thrillDesc: "Flat, slow indoor boat ride.",
            scareDesc: "Colorful Mexican twilight plaza and Donald Duck cartoons.",
            nudgeTip: "Super relaxing and funny."
          }
        ]
      }
    ]
  },
  {
    id: "hollywood-studios",
    name: "Disney's Hollywood Studios",
    resort: "disney",
    resortName: "Walt Disney World",
    icon: "🎬",
    color: "#dc2626",
    lands: [
      {
        name: "Hollywood Boulevard",
        rides: [
          {
            id: "hs-runaway-railway",
            name: "Mickey & Minnie's Runaway Railway",
            thrillBase: 2,
            scareBase: 2,
            height: "Any height",
            tags: ["dark-ride"],
            thrillDesc: "Trackless ride with fun, zippy turns, a brief simulated waterfall, and bouncing.",
            scareDesc: "Bright, zany Mickey cartoon world (a brief volcanic/waterfall scene is all cartoonish).",
            nudgeTip: "Zero real drops—it just feels like jumping inside a cartoon!"
          }
        ]
      },
      {
        name: "Echo Lake",
        rides: [
          {
            id: "hs-star-tours",
            name: "Star Tours – The Adventures Continue",
            thrillBase: 3,
            scareBase: 2,
            height: "40\"",
            tags: ["simulator"],
            thrillDesc: "Bumpy, tilting 3D flight simulator cabin.",
            scareDesc: "Star Wars space battles with Darth Vader, stormtroopers, or Kylo Ren.",
            nudgeTip: "You never actually leave the room—it's just a tilted theater with awesome Star Wars action."
          }
        ]
      },
      {
        name: "Sunset Boulevard",
        rides: [
          {
            id: "hs-tower-of-terror",
            name: "The Twilight Zone Tower of Terror",
            thrillBase: 5,
            scareBase: 5,
            height: "40\"",
            tags: ["drop", "in-the-dark"],
            thrillDesc: "High-speed elevator that shoots you up and drops you faster than gravity multiple times.",
            scareDesc: "Creepy abandoned 1930s hotel, lightning, ghostly apparitions, and pitch-black drops.",
            nudgeTip: "This is the ultimate scary + thrill combo! Only try when you're ready for big stomach-tickle drops AND spooky hotel vibes."
          },
          {
            id: "hs-rock-n-roller",
            name: "Rock 'n' Roller Coaster Starring The Muppets",
            thrillBase: 5,
            scareBase: 2,
            height: "48\"",
            tags: ["coaster", "in-the-dark", "upside-down"],
            thrillDesc: "0-to-57 mph launch in 2.8 seconds plus 3 upside-down inversions in the dark.",
            scareDesc: "Goofy, neon-lit Muppets rock concert backstage—zero spooky monsters.",
            nudgeTip: "The theming is fun and silly Muppets! It's purely about whether you want a fast launch and upside-down loops."
          }
        ]
      },
      {
        name: "Toy Story Land",
        rides: [
          {
            id: "hs-slinky-dog",
            name: "Slinky Dog Dash",
            thrillBase: 3,
            scareBase: 1,
            height: "38\"",
            tags: ["coaster"],
            thrillDesc: "Smooth outdoor family coaster with a mini mid-ride launch and bouncy camelback hills.",
            scareDesc: "Bright, sunny toy-filled backyard.",
            nudgeTip: "Zero scare factor and super fun—one of the best coasters for building confidence!"
          },
          {
            id: "hs-toy-story-mania",
            name: "Toy Story Mania!",
            thrillBase: 2,
            scareBase: 1,
            height: "Any height",
            tags: ["dark-ride", "interactive"],
            thrillDesc: "Quick whip-turns between 3D carnival shooting games.",
            scareDesc: "Bright, cheerful toy carnival.",
            nudgeTip: "Pure arcade fun—try to beat your parents' high score!"
          },
          {
            id: "hs-alien-saucers",
            name: "Alien Swirling Saucers",
            thrillBase: 2,
            scareBase: 1,
            height: "32\"",
            tags: ["spinning"],
            thrillDesc: "Whip-style spinning ride that slides you side to side.",
            scareDesc: "Bright neon space toys and cute three-eyed aliens.",
            nudgeTip: "No height or drops—just giggly side-to-side sliding."
          }
        ]
      },
      {
        name: "Star Wars: Galaxy's Edge",
        rides: [
          {
            id: "hs-rise-of-resistance",
            name: "Star Wars: Rise of the Resistance",
            thrillBase: 3,
            scareBase: 3,
            height: "40\"",
            tags: ["dark-ride", "drop", "simulator"],
            thrillDesc: "Trackless ride + one quick 20-foot escape-pod drop at the end.",
            scareDesc: "Dramatic First Order Star Destroyer, stormtroopers, Kylo Ren, and giant AT-AT walkers.",
            nudgeTip: "Feels like starring in a Star Wars movie! The single drop at the very end is super short and quick."
          },
          {
            id: "hs-smugglers-run",
            name: "Millennium Falcon: Smugglers Run",
            thrillBase: 3,
            scareBase: 2,
            height: "38\"",
            tags: ["simulator", "interactive"],
            thrillDesc: "Interactive cockpit simulator that bumps and tilts based on how your Pilots steer.",
            scareDesc: "Inside the Millennium Falcon flying through asteroid fields and space battles.",
            nudgeTip: "You get a real job (Pilot, Gunner, or Engineer) pushing buttons and flying the Falcon!"
          }
        ]
      }
    ]
  },
  {
    id: "animal-kingdom",
    name: "Disney's Animal Kingdom",
    resort: "disney",
    resortName: "Walt Disney World",
    icon: "🦁",
    color: "#16a34a",
    lands: [
      {
        name: "Pandora – The World of Avatar",
        rides: [
          {
            id: "ak-flight-of-passage",
            name: "Avatar Flight of Passage",
            thrillBase: 4,
            scareBase: 3,
            height: "44\"",
            tags: ["simulator"],
            thrillDesc: "3D flying simulator on a motorcycle-style seat that tilts and dives—you never leave the room.",
            scareDesc: "Flying over giant alien cliffs, crashing waves, and a brief dark cave with a predator.",
            nudgeTip: "If heights or big drops scare you in real life, remember your seat only tilts a few feet in front of a screen!"
          },
          {
            id: "ak-navi-river",
            name: "Na'vi River Journey",
            thrillBase: 1,
            scareBase: 2,
            height: "Any height",
            tags: ["dark-ride", "water", "gentle"],
            thrillDesc: "Ultra-smooth, flat, slow boat ride.",
            scareDesc: "Dark, glowing neon bioluminescent alien rainforest with peaceful music.",
            nudgeTip: "Even though it's dark, everything glows neon blue and purple—zero scares!"
          }
        ]
      },
      {
        name: "Africa",
        rides: [
          {
            id: "ak-kilimanjaro",
            name: "Kilimanjaro Safaris",
            thrillBase: 2,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle"],
            thrillDesc: "Bumpy open-air safari truck driving over dirt roads.",
            scareDesc: "Bright daytime savanna with real giraffes, elephants, and lions.",
            nudgeTip: "Real animals in daylight—the bumps are just like driving on a dirt road!"
          }
        ]
      },
      {
        name: "Asia",
        rides: [
          {
            id: "ak-everest",
            name: "Expedition Everest – Legend of the Forbidden Mountain",
            thrillBase: 4,
            scareBase: 4,
            height: "44\"",
            tags: ["coaster", "in-the-dark"],
            thrillDesc: "Big fast coaster with a backward spiral in the dark and an 80-foot drop; no loops.",
            scareDesc: "Broken train tracks, a shadowed Yeti tearing up tracks, and a giant animatronic Yeti at the end.",
            nudgeTip: "The Yeti only swoops over you for 2 seconds at the very end—and there are zero upside-down loops!"
          },
          {
            id: "ak-kali-river",
            name: "Kali River Rapids",
            thrillBase: 3,
            scareBase: 2,
            height: "38\"",
            tags: ["water", "spinning", "drop"],
            thrillDesc: "Spinning round river raft with one 20-foot wet plunge.",
            scareDesc: "Lush jungle with a brief smoky forest-fire scene before the splash.",
            nudgeTip: "The biggest risk here is getting totally soaked—bring a poncho if you don't want wet socks!"
          }
        ]
      },
      {
        name: "Discovery Island & Rafiki's Planet Watch",
        rides: [
          {
            id: "ak-wildlife-train",
            name: "Wildlife Express Train",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle"],
            thrillDesc: "Slow rustic passenger train.",
            scareDesc: "Daylight backstage animal barns.",
            nudgeTip: "Chill train ride to the petting zoo and animation class."
          }
        ]
      }
    ]
  },
  {
    id: "universal-studios",
    name: "Universal Studios Florida",
    resort: "universal",
    resortName: "Universal Orlando",
    icon: "🌎",
    color: "#7c3aed",
    lands: [
      {
        name: "The Wizarding World of Harry Potter – Diagon Alley",
        rides: [
          {
            id: "usf-gringotts",
            name: "Harry Potter and the Escape from Gringotts",
            thrillBase: 3,
            scareBase: 4,
            height: "42\"",
            tags: ["coaster", "dark-ride", "in-the-dark", "drop"],
            thrillDesc: "Mostly a 3D dark ride with one quick tilted drop at the start and a brief coaster burst.",
            scareDesc: "Dark underground vaults, goblins, Bellatrix, Voldemort, trolls, and a fire-breathing dragon.",
            nudgeTip: "It looks like a big coaster, but 80% of it is a smooth 3D dark ride with only one short drop!"
          },
          {
            id: "usf-hogwarts-express",
            name: "Hogwarts Express – King's Cross Station",
            thrillBase: 1,
            scareBase: 2,
            height: "Any height",
            tags: ["gentle"],
            thrillDesc: "Smooth train ride connecting Universal Studios and Islands of Adventure.",
            scareDesc: "Train compartment windows show fun magic and one brief Dementor shadow.",
            nudgeTip: "Just a real train ride—Dementors only rattle the door for a few seconds."
          }
        ]
      },
      {
        name: "Minion Land",
        rides: [
          {
            id: "usf-minion-mayhem",
            name: "Despicable Me Minion Mayhem",
            thrillBase: 2,
            scareBase: 1,
            height: "40\"",
            tags: ["simulator"],
            thrillDesc: "Tilting, bouncing 3D theater seats (stationary seats also available!).",
            scareDesc: "Colorful, silly Minion training lab.",
            nudgeTip: "Super funny and upbeat—and you can ask for a non-moving seat if you want!"
          },
          {
            id: "usf-minion-blast",
            name: "Illumination's Villain-Con Minion Blast",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["interactive", "gentle"],
            thrillDesc: "Standing on a slow moving walkway while aiming a blaster at huge screens.",
            scareDesc: "Bright, cartoonish villain convention.",
            nudgeTip: "Zero drops or spinning—just a giant stand-up video game!"
          }
        ]
      },
      {
        name: "DreamWorks Land",
        rides: [
          {
            id: "usf-trolls",
            name: "Trolls Trollercoaster",
            thrillBase: 2,
            scareBase: 1,
            height: "36\"",
            tags: ["coaster"],
            thrillDesc: "Short, mild outdoor family coaster.",
            scareDesc: "Bright, colorful Trolls forest.",
            nudgeTip: "Super friendly warm-up coaster!"
          },
          {
            id: "usf-et-adventure",
            name: "E.T. Adventure",
            thrillBase: 1,
            scareBase: 2,
            height: "34\"",
            tags: ["dark-ride", "gentle"],
            thrillDesc: "Slow suspended bike ride gliding gently over models.",
            scareDesc: "Dark forest at the start with police flashlights, then a bright glowing alien planet.",
            nudgeTip: "E.T. says your name at the end—super gentle and nostalgic."
          }
        ]
      },
      {
        name: "New York",
        rides: [
          {
            id: "usf-mummy",
            name: "Revenge of the Mummy",
            thrillBase: 4,
            scareBase: 5,
            height: "48\"",
            tags: ["coaster", "in-the-dark"],
            thrillDesc: "Fast indoor launched coaster in the dark with sudden drops and a short backward section; no loops.",
            scareDesc: "Creepy Egyptian tomb, mummies jumping out, scarab beetles, and real fire on the ceiling!",
            nudgeTip: "Heads up: this has real jump-scares AND fast coaster launches. Great challenge once you're feeling brave!"
          },
          {
            id: "usf-jimmy-fallon",
            name: "Race Through New York Starring Jimmy Fallon",
            thrillBase: 2,
            scareBase: 1,
            height: "40\"",
            tags: ["simulator"],
            thrillDesc: "Gentle 3D flying-theater motion.",
            scareDesc: "Bright, silly NYC race with confetti and fireworks.",
            nudgeTip: "Zero scares—just a goofy 3D race."
          },
          {
            id: "usf-transformers",
            name: "Transformers: The Ride-3D",
            thrillBase: 3,
            scareBase: 3,
            height: "40\"",
            tags: ["simulator", "dark-ride"],
            thrillDesc: "Fast-moving 3D motion-base car that tilts, shakes, and simulates falling from skyscrapers.",
            scareDesc: "Loud explosions, giant Decepticons lunging in 3D, and intense battle action.",
            nudgeTip: "The 'fall' off the building is just your car tilting in front of a 3D screen—you never actually drop!"
          }
        ]
      },
      {
        name: "Springfield: Home of the Simpsons",
        rides: [
          {
            id: "usf-simpsons",
            name: "The Simpsons Ride",
            thrillBase: 3,
            scareBase: 2,
            height: "40\"",
            tags: ["simulator"],
            thrillDesc: "Bumpy, swooping 3D dome simulator pretending to be a crazy roller coaster.",
            scareDesc: "Bright, goofy Simpsons theme park with Sideshow Bob.",
            nudgeTip: "Not a real coaster—just a tilting simulator room, though it can feel bumpy."
          },
          {
            id: "usf-kang-kodos",
            name: "Kang & Kodos' Twirl 'n' Hurl",
            thrillBase: 2,
            scareBase: 1,
            height: "Any height",
            tags: ["spinning"],
            thrillDesc: "Outdoor flying saucer spinner where you control up/down.",
            scareDesc: "Bright cartoon alien plaza.",
            nudgeTip: "Easy, sunny spinner ride."
          }
        ]
      },
      {
        name: "World Expo",
        rides: [
          {
            id: "usf-mib",
            name: "MEN IN BLACK Alien Attack",
            thrillBase: 2,
            scareBase: 2,
            height: "42\"",
            tags: ["dark-ride", "interactive", "spinning"],
            thrillDesc: "Slow indoor car with a couple of quick 360-degree spins when hit.",
            scareDesc: "Dark NYC streets with goofy/slimy animatronic aliens to zap.",
            nudgeTip: "You have a laser zapper the whole time, so you're the hero blasting the aliens!"
          }
        ]
      }
    ]
  },
  {
    id: "islands-of-adventure",
    name: "Universal Islands of Adventure",
    resort: "universal",
    resortName: "Universal Orlando",
    icon: "🦖",
    color: "#ea580c",
    lands: [
      {
        name: "Marvel Super Hero Island",
        rides: [
          {
            id: "ioa-hulk",
            name: "The Incredible Hulk Coaster",
            thrillBase: 5,
            scareBase: 2,
            height: "54\"",
            tags: ["coaster", "upside-down"],
            thrillDesc: "Extreme 67 mph uphill launch straight into 7 upside-down loops!",
            scareDesc: "Bright green outdoor steel coaster—loud roar, zero spooky monsters.",
            nudgeTip: "Pure extreme coaster thrills (and 54\" height requirement). Zero spooky stuff!"
          },
          {
            id: "ioa-spiderman",
            name: "The Amazing Adventures of Spider-Man",
            thrillBase: 3,
            scareBase: 3,
            height: "40\"",
            tags: ["simulator", "dark-ride"],
            thrillDesc: "Moving 3D motion-base car with spins, heat blasts, and a simulated skyscraper drop.",
            scareDesc: "Dark city streets with comic-book villains (Doc Ock, Electro, Green Goblin).",
            nudgeTip: "Spider-Man is right there saving you the whole time, and the 400-foot drop at the end is 100% 3D illusion!"
          },
          {
            id: "ioa-dr-doom",
            name: "Doctor Doom's Fearfall",
            thrillBase: 5,
            scareBase: 3,
            height: "52\"",
            tags: ["drop"],
            thrillDesc: "Shoots you 150 feet straight up into the air in 2 seconds, then bounces down.",
            scareDesc: "Dramatic Doctor Doom lab, then open-air sky views.",
            nudgeTip: "The upward launch is way smoother than a downward drop—once you're at the top, the view is awesome!"
          },
          {
            id: "ioa-storm-force",
            name: "Storm Force Accelatron",
            thrillBase: 2,
            scareBase: 1,
            height: "Any height",
            tags: ["spinning"],
            thrillDesc: "Teacup-style spinning ride you control.",
            scareDesc: "Covered outdoor pavilion with flashing lightning effects.",
            nudgeTip: "Just like Disney's teacups—you control the spin."
          }
        ]
      },
      {
        name: "Toon Lagoon",
        rides: [
          {
            id: "ioa-ripsaw-falls",
            name: "Dudley Do-Right's Ripsaw Falls",
            thrillBase: 4,
            scareBase: 1,
            height: "44\"",
            tags: ["water", "drop"],
            thrillDesc: "Log flume with a huge, steep 75-foot splash drop at the end.",
            scareDesc: "Bright, goofy cartoon scenes.",
            nudgeTip: "Zero spooky factor—just a massive, hilarious water drop that will soak you!"
          },
          {
            id: "ioa-popeye",
            name: "Popeye & Bluto's Bilge-Rat Barges",
            thrillBase: 3,
            scareBase: 1,
            height: "42\"",
            tags: ["water", "spinning"],
            thrillDesc: "Bouncy, spinning white-water river raft; no huge drops, LOTS of water.",
            scareDesc: "Bright cartoon harbor.",
            nudgeTip: "Expect to be 100% drenched from head to toe—super fun on a hot day!"
          }
        ]
      },
      {
        name: "Skull Island: Reign of Kong",
        rides: [
          {
            id: "ioa-kong",
            name: "Skull Island: Reign of Kong",
            thrillBase: 2,
            scareBase: 4,
            height: "36\"",
            tags: ["dark-ride", "simulator"],
            thrillDesc: "Giant expedition truck that rumbles and shakes gently; zero drops.",
            scareDesc: "Dark jungle caves, giant 3D bugs/dinosaurs fighting, and a huge realistic King Kong.",
            nudgeTip: "The truck barely moves fast at all! It's all about giant screens and King Kong saving your truck."
          }
        ]
      },
      {
        name: "Jurassic Park",
        rides: [
          {
            id: "ioa-velocicoaster",
            name: "Jurassic World VelociCoaster",
            thrillBase: 5,
            scareBase: 3,
            height: "51\"",
            tags: ["coaster", "upside-down"],
            thrillDesc: "70 mph dual-launch coaster, 155-foot top hat drop, 4 inversions, and lap-bar-only airtime.",
            scareDesc: "Raptor paddock with glowing lights and dramatic dinosaur chase vibes.",
            nudgeTip: "One of the most intense coasters in the world—save this for when you're feeling like a total coaster pro!"
          },
          {
            id: "ioa-jp-river",
            name: "Jurassic Park River Adventure",
            thrillBase: 4,
            scareBase: 4,
            height: "42\"",
            tags: ["water", "drop", "in-the-dark"],
            thrillDesc: "Calm dinosaur boat tour ending with a giant 85-foot plunge.",
            scareDesc: "Starts peaceful and sunny, then goes into a dark raptor building with a giant T-Rex lunging before the drop.",
            nudgeTip: "The first half is peaceful dinosaurs in daylight! The T-Rex only appears for 3 seconds right before the splash."
          },
          {
            id: "ioa-pteranodon",
            name: "Pteranodon Flyers",
            thrillBase: 2,
            scareBase: 1,
            height: "36\"–56\" (or with child)",
            tags: ["gentle"],
            thrillDesc: "Gentle swinging suspended glider high over Camp Jurassic.",
            scareDesc: "Bright outdoor treetops.",
            nudgeTip: "A 10-year-old is often the golden ticket height for parents to ride this too!"
          }
        ]
      },
      {
        name: "The Wizarding World of Harry Potter – Hogsmeade",
        rides: [
          {
            id: "ioa-hagrids",
            name: "Hagrid's Magical Creatures Motorbike Adventure",
            thrillBase: 4,
            scareBase: 3,
            height: "48\"",
            tags: ["coaster", "drop"],
            thrillDesc: "7 launches, a backward section, and a surprise short vertical track drop—no upside-down loops!",
            scareDesc: "Forbidden Forest with magical creatures, Fluffy, and Devil's Snare.",
            nudgeTip: "Super smooth and story-driven! Even the surprise drop is tiny and super fun."
          },
          {
            id: "ioa-forbidden-journey",
            name: "Harry Potter and the Forbidden Journey",
            thrillBase: 4,
            scareBase: 4,
            height: "48\"",
            tags: ["simulator", "dark-ride", "in-the-dark"],
            thrillDesc: "Robotic arm swings you onto your back and swoops fast around screens and sets (no inversions).",
            scareDesc: "Giant spiders, a dragon, Whomping Willow, and creepy Dementors up close!",
            nudgeTip: "You're flying with Harry the whole time! If spiders/Dementors freak you out, close your eyes for 5 seconds during the dark cave."
          },
          {
            id: "ioa-hippogriff",
            name: "Flight of the Hippogriff",
            thrillBase: 2,
            scareBase: 1,
            height: "36\"",
            tags: ["coaster"],
            thrillDesc: "Short, mild outdoor family roller coaster.",
            scareDesc: "Sunny pumpkin patch and Buckbeak animatronic.",
            nudgeTip: "Great warm-up coaster in Hogsmeade!"
          },
          {
            id: "ioa-hogwarts-express",
            name: "Hogwarts Express – Hogsmeade Station",
            thrillBase: 1,
            scareBase: 2,
            height: "Any height",
            tags: ["gentle"],
            thrillDesc: "Smooth train ride back to Universal Studios Florida.",
            scareDesc: "Fun magical train windows with a brief Voldemort/Dementor shadow.",
            nudgeTip: "Different show on the way back than on the way there!"
          }
        ]
      },
      {
        name: "Seuss Landing",
        rides: [
          {
            id: "ioa-cat-in-hat",
            name: "The Cat in the Hat",
            thrillBase: 2,
            scareBase: 1,
            height: "36\"",
            tags: ["dark-ride", "spinning"],
            thrillDesc: "Indoor couch ride with mild spins and zig-zags.",
            scareDesc: "Bright, goofy Dr. Seuss storybook.",
            nudgeTip: "Totally silly and bright."
          },
          {
            id: "ioa-seuss-trolley",
            name: "The High in the Sky Seuss Trolley Train Ride!",
            thrillBase: 1,
            scareBase: 1,
            height: "36\"",
            tags: ["gentle"],
            thrillDesc: "Slow elevated track ride above Seuss Landing.",
            scareDesc: "Bright sunny park views.",
            nudgeTip: "Super chill scenic ride."
          },
          {
            id: "ioa-one-fish",
            name: "One Fish, Two Fish, Red Fish, Blue Fish",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["spinning", "gentle", "water"],
            thrillDesc: "Gentle aerial fish spinner where you dodge water sprays.",
            scareDesc: "Bright playful fountain.",
            nudgeTip: "Listen to the song to avoid getting squirted!"
          },
          {
            id: "ioa-caro-seuss-el",
            name: "Caro-Seuss-el",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle"],
            thrillDesc: "Classic slow carousel.",
            scareDesc: "Bright Seuss creatures.",
            nudgeTip: "Easy, fun classic."
          }
        ]
      }
    ]
  },
  {
    id: "epic-universe",
    name: "Universal Epic Universe",
    resort: "universal",
    resortName: "Universal Orlando",
    icon: "✨",
    color: "#9333ea",
    lands: [
      {
        name: "Celestial Park",
        rides: [
          {
            id: "eu-stardust-racers",
            name: "Stardust Racers",
            thrillBase: 5,
            scareBase: 2,
            height: "48\"",
            tags: ["coaster", "upside-down"],
            thrillDesc: "Dual-racing launch coaster up to 62 mph with inversions and a crisscrossing 'Celestial Spin'.",
            scareDesc: "Open-air cosmic starlight track—no spooky monsters.",
            nudgeTip: "Pure high-speed racing coaster thrills without any creepy theming!"
          },
          {
            id: "eu-constellation-carousel",
            name: "Constellation Carousel",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["gentle", "spinning"],
            thrillDesc: "Gentle spinning carousel whose creatures glide and lift up to 6 feet.",
            scareDesc: "Sparkling celestial garden.",
            nudgeTip: "Way cooler than a normal carousel, still super chill."
          }
        ]
      },
      {
        name: "The Wizarding World of Harry Potter – Ministry of Magic",
        rides: [
          {
            id: "eu-battle-ministry",
            name: "Harry Potter and the Battle at the Ministry",
            thrillBase: 3,
            scareBase: 3,
            height: "40\"",
            tags: ["dark-ride", "simulator", "drop"],
            thrillDesc: "Omnidirectional magical lift vehicle with sudden lifts, tilts, and quick drops.",
            scareDesc: "Dramatic British Ministry of Magic chase with Dolores Umbridge and Death Eaters.",
            nudgeTip: "Feels like stepping straight into the movies—the drops are quick, bouncy elevator bursts, not huge coaster plunges."
          }
        ]
      },
      {
        name: "SUPER NINTENDO WORLD",
        rides: [
          {
            id: "eu-mario-kart",
            name: "Mario Kart: Bowser's Challenge",
            thrillBase: 2,
            scareBase: 2,
            height: "40\"",
            tags: ["dark-ride", "interactive"],
            thrillDesc: "Smooth, slow-to-medium kart track with AR visor steering and shell-throwing.",
            scareDesc: "Bowser's castle and Rainbow Road—colorful video game action.",
            nudgeTip: "Feels just like playing Mario Kart in real life! Zero scary drops."
          },
          {
            id: "eu-mine-cart-madness",
            name: "Mine-Cart Madness",
            thrillBase: 3,
            scareBase: 2,
            height: "40\"",
            tags: ["coaster"],
            thrillDesc: "Family coaster with a clever hidden track that makes it feel like you're jumping broken mine tracks!",
            scareDesc: "Bright Donkey Kong Country jungle with Tiki Tak Tribe.",
            nudgeTip: "Looks wild because of the broken-track illusion, but the ride itself is a super fun family coaster!"
          },
          {
            id: "eu-yoshi",
            name: "Yoshi's Adventure",
            thrillBase: 1,
            scareBase: 1,
            height: "34\"",
            tags: ["gentle"],
            thrillDesc: "Slow, peaceful scenic omnimover ride.",
            scareDesc: "Bright, cheerful Mushroom Kingdom views.",
            nudgeTip: "Best way to see all of Super Nintendo World from above!"
          }
        ]
      },
      {
        name: "How to Train Your Dragon – Isle of Berk",
        rides: [
          {
            id: "eu-wing-gliders",
            name: "Hiccup's Wing Gliders",
            thrillBase: 3,
            scareBase: 1,
            height: "40\"",
            tags: ["coaster"],
            thrillDesc: "Smooth family multi-launch coaster swooping over the Viking village and lagoon (no loops).",
            scareDesc: "Bright, sunny Isle of Berk with Toothless and friendly dragons.",
            nudgeTip: "Zero scares and super smooth—built specifically for families and 10-year-olds!"
          },
          {
            id: "eu-dragon-racer",
            name: "Dragon Racer's Rally",
            thrillBase: 3,
            scareBase: 1,
            height: "48\"",
            tags: ["spinning"],
            thrillDesc: "High-flying Sky Fly ride where YOU control wings to stay flat or flip upside down.",
            scareDesc: "Bright outdoor Viking sky.",
            nudgeTip: "You don't have to flip if you don't want to—you control the wings yourself!"
          },
          {
            id: "eu-fyre-drill",
            name: "Fyre Drill",
            thrillBase: 1,
            scareBase: 1,
            height: "Any height",
            tags: ["water", "interactive", "gentle"],
            thrillDesc: "Slow boat battle where you aim water cannons at targets (and other boats!).",
            scareDesc: "Bright sunny lagoon.",
            nudgeTip: "Zero drops—just a giant floating water-cannon game!"
          }
        ]
      },
      {
        name: "Dark Universe",
        rides: [
          {
            id: "eu-monsters-unchained",
            name: "Monsters Unchained: The Frankenstein Experiment",
            thrillBase: 4,
            scareBase: 5,
            height: "48\"",
            tags: ["dark-ride", "simulator", "in-the-dark"],
            thrillDesc: "Robotic-arm dark ride with fast swoops, tilts, and sudden turns (no inversions).",
            scareDesc: "Very dark catacombs with intense realistic Dracula, Wolf Man, Mummy, and Frankenstein monsters!",
            nudgeTip: "Heads up: this is Universal's scariest-themed dark ride! If classic monsters are cool to you, the ride itself is super awesome."
          },
          {
            id: "eu-curse-werewolf",
            name: "Curse of the Werewolf",
            thrillBase: 3,
            scareBase: 3,
            height: "40\"",
            tags: ["coaster", "spinning"],
            thrillDesc: "Family-friendly spinning multi-launch coaster with backward & forward launches (no inversions).",
            scareDesc: "Moody moonlit forest with glowing werewolf eyes.",
            nudgeTip: "The coaster itself is very approachable (40\" height)—the spooky forest is mostly atmosphere!"
          }
        ]
      }
    ]
  }
];
