import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import { stories } from '../data/content';
import './StoryDetail.css';

// Extended story content for each story
const storyContent = {
  "what-altitude-does": `
They tell you about the headache. About the nausea that can arrive at 3,500 metres if you go too fast. They tell you to drink water, to ascend slowly, to watch for signs.

They don't tell you about the other thing.

The other thing is harder to name. It begins somewhere around day two or three, when the noise of your ordinary life has finally lost transmission. When the last email has stopped mattering. When the group chat notification no longer produces anything in you at all.

What fills the space is surprising. Not peace — at least not immediately. First there is restlessness. Then boredom. Then, if you stay with it, something that begins to feel like presence.

At altitude, the body is occupied with something real: the work of breathing, the management of temperature, the attention required to place one foot correctly. The body is busy in the most honest way a body can be busy.

And the mind, freed from its usual performance, begins to slow.

I have noticed this across many mountains and many people. The quietest people at camp on day four are often those who arrived the loudest. Something happens to urgency up there. The calendar dissolves. The metrics stop.

What you are left with is something resembling yourself.

Not the self you present. The self that was there before you had to present anything.

The mountain did not create this. It only cleared the path to it.
  `,
  "the-cook-at-camp": `
His name was Mohan. He appeared at camp each morning before the sun, and the first thing you saw, coming out of your tent, was the small orange glow of the gas stove and the shape of him crouching beside it.

He made dal every night for eight days. Always on time. Always the right temperature.

On the third night I sat near him while he cooked and I asked him how long he had been doing this. He said something about many seasons. He didn't elaborate. I didn't push.

He was from a village two valleys over. He had a daughter in school. He had a philosophy about cooking at altitude that I did not fully understand because my Hindi was not good enough and his patience for translation was limited.

What I understood: he believed that food at camp needed to be simple because the environment was already complicated. He believed that a person who is cold and tired does not need complexity — they need temperature and salt.

I thought about this for the rest of the trek. And then, honestly, I thought about it for weeks after.

We are surrounded by complexity that we have convinced ourselves is sophistication. The cook at camp knew the difference.

I never asked him where he went in the off-season. I never asked him what he thought about while he cooked. In retrospect, those questions would have been about me, not him.

He fed us every night. That was the whole thing. That was enough.
  `,
  "first-time-at-roopkund": `
I had read everything.

I had read the accounts of other trekkers, the altitude data, the archaeological reports about the bones. I had trained on stairs with a loaded pack for six weeks. I had sourced the right base layers and I had bought microspikes and I had broken in my boots properly.

And then I was there.

The lake appears without ceremony. The trail rounds a moraine and the lake is simply present — a dark eye in the rock, partially iced even in September. And around it and below the surface of it: the bones.

Hundreds of them. Skulls, femurs, ribs, preserved in the cold for what researchers now believe may be over a thousand years. No one knows with complete certainty why they are all here. There are theories — a pilgrimage gone wrong, a sudden hailstorm, a military march. None of them is conclusive.

I had known all of this before I came.

And standing there, I found that knowing and understanding are entirely different countries.

The preparation had been for the body. The body arrived fine. The body was cold and tired but essentially fine.

The thing I had not prepared was the part that stood at the edge of that lake and understood, in a way that no reading could have delivered, that something very human had happened here and that the mountain had simply held it.

I stayed longer than anyone in my group. No one said anything about it.

That silence is also part of what the mountain offered.
  `,
  "on-not-summiting": `
We turned back 200 metres from the top.

The weather was part of it. The clouds had arrived quickly and the wind was making the ridge genuinely difficult. The guide made the call. I agreed with it.

But there was something else.

Something in me — I noticed it only later — had already felt complete. Not defeated. Complete. As if the mountain had given me what I needed and the summit was a bonus I didn't require.

I have talked to other trekkers who have turned back. The responses vary. Some carry real grief about it. The summit represented something to them and not reaching it felt like not finishing a sentence.

I understand that feeling. I have had it on other trails.

But on this particular day, on this particular mountain, the turn-back felt right in a way I could not have predicted. The ascent had been the point. The views from the ridge — before the clouds closed in — had been more than sufficient.

There is a version of the summit obsession that is about proving something to yourself. And there is a version that is simply about the specific beauty of being at the highest point. The first version can make turning back feel like failure.

What I'm trying to say is: the mountain does not care about your completion rate.

It offered you a day. What you did with it is what matters.
  `,
  "winter-solo": `
I woke at 4am without an alarm.

The tent was silent. I could hear the wind but distantly, as if it were preoccupied with something else. I put on my down jacket over my sleeping clothes and unzipped the tent and stepped out.

The stars at 4,000 metres at 4am in January are not stars you have seen before.

I know that sounds like something you would read on a poster. I'm telling you anyway because it is true in a way that I have not found a better way to describe.

There was no moon. The Milky Way was overhead and fully visible, not as a concept but as a physical river of light that I stood beneath and looked up at.

The mountains around camp were dark shapes against a slightly less dark sky. Trishul to the north. The Nanda Ghunti ridge.

I stood there for maybe forty minutes. No phone. No camera. I had left both in the tent because I wanted to see this with just my eyes.

I thought about nothing in particular. Or rather: thoughts arrived and passed without accumulating. The cold was real and I was aware of it but it was not unpleasant. It was honest cold, which is different from the cold of a city in winter.

At some point I went back into the tent.

I did not tell anyone about this the next morning. It felt like it belonged to the night and to the mountain and to me, specifically, and sharing it would have changed its nature.

This is what solo moments at altitude give you: experiences that are entirely yours.
  `,
  "phone-free-trek": `
The anxiety arrives on day one, usually in the afternoon.

You've been walking for a few hours. The first glow of being in the mountains is still present. And then a familiar reflex fires — the hand moves toward the pocket — and finds nothing.

Or finds the phone, but opens it to no signal.

This moment is worth paying attention to, because it tells you something about the dependency you've built. Not a moral failing. Just a fact about modern nervous systems.

The first day is the hardest.

A practical note: turn the phone off completely, not to airplane mode. The difference is psychological but it matters. A phone in airplane mode is still waiting. A phone that is off has been put to rest.

The second day, the reflex fires less frequently.

By day three, something shifts. Not a dramatic transformation — just a quieting. The bandwidth that was being consumed by the phone — by its potential, its waiting notifications, its availability — becomes available for other things.

What fills it is surprising. Observation, mostly. You begin to notice things at the pace they deserve to be noticed at: the way light moves through a pine forest at 10am, the precise sound of a glacial stream, the small conversations that happen when people are not dividing their attention.

On day five, I stopped thinking about my phone entirely.

On day seven, someone in our group found a weak signal near a high ridge and checked their messages. They did not look happier for it. They looked briefly somewhere else, and then back.

The mountain does not compete with your phone for your attention. It simply offers itself, fully and without urgency, and waits to see what you choose.
  `
};

export default function StoryDetail() {
  const { id } = useParams();
  const story = stories.find(s => s.id === id);
  const content = storyContent[id];

  if (!story) {
    return (
      <div className="page-wrapper" style={{ padding: '14rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
          This story does not exist — yet.
        </p>
        <Link to="/stories" style={{ marginTop: '2rem', display: 'inline-block', color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          &larr; Back to stories
        </Link>
      </div>
    );
  }

  const paragraphs = content ? content.trim().split('\n\n').filter(Boolean) : [];

  return (
    <div className="page-wrapper sd">
      <div className="sd__header">
        <div className="container--narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Link to="/stories" className="sd__back">← Stories</Link>
            <div className="sd__meta">
              <span className="section-label">{story.category}</span>
              <span className="sd__date">{story.date}</span>
              <span className="sd__read">{story.readTime} read</span>
            </div>
            <h1 className="sd__title">{story.title}</h1>
            <p className="sd__subtitle">{story.subtitle}</p>
          </motion.div>
        </div>
      </div>

      <div className="container--narrow sd__body">
        <FadeIn>
          <p className="sd__lede">{story.preview}</p>
        </FadeIn>
        <div className="sd__divider" />
        {paragraphs.map((para, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <p className="sd__para">{para.trim()}</p>
          </FadeIn>
        ))}
        <FadeIn>
          <div className="sd__signature">— Deepak Yadav</div>
        </FadeIn>
        <FadeIn>
          <div className="sd__footer-nav">
            <Link to="/stories" className="link-subtle">← All Stories</Link>
            <Link to="/journeys" className="link-subtle">Explore Journeys →</Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
