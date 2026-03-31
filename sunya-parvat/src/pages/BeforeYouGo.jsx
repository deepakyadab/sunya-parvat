import React from 'react';
import { motion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import './BeforeYouGo.css';

const demands = [
  {
    number: '01',
    title: 'Your body, honestly assessed',
    content: `The mountain does not adjust to your fitness. You adjust to the mountain. This is not a threat — it is the first and most useful truth about high-altitude trekking.

Before any of the journeys described here, you should be comfortable walking for six to eight hours consecutively on uneven terrain with a loaded pack. This is not a performance standard. It is a baseline for arriving at camp without having spent everything you have.

Train on stairs. Walk with weight on your back. Build the habit of using your body in the months before the trail, not the week before.

The body you bring will be the body you rely on. Know it well.`
  },
  {
    number: '02',
    title: 'Mental readiness — which is different from motivation',
    content: `Motivation is abundant at the trailhead. It is Day 4 that asks the real question.

Day 4, when the novelty has passed and the body is tired and the camp is cold and the summit is still two days away. This is when the quality of your mental preparation becomes clear.

Mental readiness for the mountains is not about being tough. It is about having made a prior agreement with discomfort — acknowledging in advance that difficult moments will arrive and that they are not reasons to stop.

It also means understanding that the mountain will not always be beautiful. Some hours will be tedious. Some descents will be miserable. Some camps will be wet and cold and offer nothing cinematic.

You are going anyway. Not despite this — because of it.`
  },
  {
    number: '03',
    title: 'Discipline, which is just respect by another name',
    content: `The mountains operate by rules that predate your convenience.

Acclimatisation is not optional. Going too high too fast creates real medical risk, regardless of how fit you are. The ascent profiles recommended for each journey are not suggestions — they are the result of experience.

Weather windows close without consulting your plans. Turnaround times are not arbitrary. The guide who says we need to go back is reading something you may not yet have the experience to read yourself.

Discipline at altitude means listening more than deciding. It means trusting the mountain's logic over your own timeline.

This is, incidentally, useful practice for life in general.`
  },
  {
    number: '04',
    title: 'The right gear — not more gear',
    content: `There is a version of preparation that becomes a substitute for readiness. You own the perfect jacket but you have not walked ten kilometres with weight on your back.

For the journeys described here: good boots that are broken in, layers that can be added and removed, a sleeping bag rated for the temperatures you will actually encounter, and a pack that fits your body.

That is nearly all of it.

The rest — the gadgets, the systems, the optimised gear configurations — are secondary to the simple question of whether you have walked enough, slept enough, and arrived at the trailhead honest about what you are capable of.`
  },
  {
    number: '05',
    title: 'The willingness to be changed',
    content: `This is the one the gear lists and training plans cannot prepare you for.

People who return from significant mountain experiences often describe a period of difficulty upon returning to ordinary life. Not depression, exactly — more like a recalibration. The ordinary things look different. The usual urgencies seem smaller. The things that felt fixed feel temporarily loosened.

This is not always comfortable. It is always valuable.

Go with an openness to returning different from how you left. Not transformed in any dramatic, poster-worthy sense. Just: slightly reordered. Slightly more honest about what matters.

The mountain will do its part. Your part is arriving willing.`
  }
];

export default function BeforeYouGo() {
  return (
    <div className="page-wrapper byg">

      <div className="byg__header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="section-label" style={{ marginBottom: '1.5rem' }}>Before You Go</div>
            <h1 className="page-title byg__title">
              What the mountain<br />demands from you.
            </h1>
            <p className="page-subtitle byg__subtitle">
              Not a safety briefing. Not a checklist.<br />
              An honest conversation about what going into the mountains actually requires.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container--narrow byg__body">

        <FadeIn>
          <p className="byg__intro">
            The mountain is not hostile. It is indifferent. There is an important difference.
            Indifference means the mountain will offer the same conditions to the prepared
            and the unprepared. It will not adjust. It will not make exceptions.
            What you bring is what you will have.
          </p>
        </FadeIn>

        <div className="byg__demands">
          {demands.map((demand, i) => (
            <FadeIn key={demand.number} delay={i * 0.1}>
              <div className="byg__demand">
                <div className="byg__demand-number">{demand.number}</div>
                <div className="byg__demand-content">
                  <h2 className="byg__demand-title">{demand.title}</h2>
                  {demand.content.trim().split('\n\n').map((para, j) => (
                    <p key={j} className="byg__demand-text">{para.trim()}</p>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="byg__closing">
            <blockquote className="byg__quote">
              The mountain asks nothing of you that you cannot give.<br />
              But it asks everything that you can.
            </blockquote>
            <p className="byg__closing-text">
              When you feel ready — not confident, but ready — the journeys are waiting.
            </p>
          </div>
        </FadeIn>

      </div>
    </div>
  );
}
