import React from 'react';
// import ReactDOM from 'react-dom';
// import { ReactMic } from 'react-mic';
// import MIDISounds from 'midi-sounds-react';
import logo from './Build-A-Beat.svg';
import './App.scss';
import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import 'p5/lib/addons/p5.sound';


// Import user_input for analysis / bin creation
import u_bass from './user_input/u_bass.mp3';
import u_snare from './user_input/u_snare.mp3';
import u_open_hh from './user_input/u_open_hh.mp3';
import u_closed_hh from './user_input/u_closed_hh.mp3';

// Import real_drum sounds
import bass from './real_drum/bass.mp3';
import snare from './real_drum/snare.mp3';
import open_hh from './real_drum/open_hh.mp3';
import closed_hh from './real_drum/closed_hh.mp3';

class App extends React.Component {
  constructor(prop) {
    super(prop);

    this.state = {
      ready : false
    };

    let process_bass = () => {
      preProcessingGivenType(u_bass).then(res => {
        console.log(res);
        this.setState({bass: res});
      });
    };

    let process_snare = () => {
    preProcessingGivenType(u_snare).then(res => {
      console.log(res);
      this.setState({ snare : res });
    });
    };
    let process_open = () => {
      preProcessingGivenType(u_open_hh).then(res => {
        console.log(res);
        this.setState({open: res});
      });
    };

    let process_closed = () => {
      preProcessingGivenType(u_closed_hh).then(res => {
        console.log(res);
        this.setState({closed: res});
      });
    };

    let build_arguments = () => {
      let temp = [this.state.bass, this.state.snare, this.state.open, this.state.closed];
      // let temp = {bass: this.state.bass,
      //             snare: this.state.snare,
      //             open: this.state.open,
      //             closed: this.state.closed};
      console.log(temp);
      this.setState({all_arg : temp} );
      this.setState( {ready : true} );
    };
    setTimeout(build_arguments, 12000);

    setTimeout(process_bass, 1000);
    setTimeout(process_snare, 2000);
    setTimeout(process_open, 3000);
    setTimeout(process_closed, 4000);



    // debugger;
  }
  // this.state.bass
  render() {
    const {ready} = this.state;
    console.log(ready);
    return ready ? <Sketch data={this.state.all_arg}/> : <span> Loading Elements </span>;
  }
}

function preProcessingGivenType(type) {
  return new Promise(resolve => {
    let spectrums_with_amp = [];
    let count = 0;
    // let processingP5;
    // self._last_sound_at = 0;

    const sketch = p => {
      let fft;
      let noise;
      let amp;

      p.preload = function () { // For audio analysis
        p.soundFormats('mp3', 'ogg');
        noise = p.loadSound(type);
        // debugger;
      };

      p.setup = function () {
        // debugger;
        noise.play();
        // debugger;
        fft = new p5.FFT();
        fft.setInput(noise);

        amp = new p5.Amplitude();
        amp.setInput(noise);
      };

      p.draw = function () {
        // debugger;
        spectrums_with_amp.push([fft.analyze(), amp.getLevel()]);
        if (count === 400) {
          // Find max amplitude and save the spectrum that occured at that point.
          let max = [0, 0];
          let i;
          for (i = 0; i < spectrums_with_amp.length; i++) {
            let analysis = spectrums_with_amp[i];
            // console.log(analysis[0]);
            if (analysis[1] > max[1]) {
              max = [analysis[0], analysis[1]];
            }
          }

          // save a value to be returned by the class/function
          resolve(max);
        }

        count++;
      };
    };

    const _ = new p5(sketch);
  });
}

class Sketch extends React.Component {
  // new p5(this.sketch, this.root);
  constructor(data) {
    // run regular ass javascript inside the constructor
    super(data); // Sets up the class for me

    const comp_data = data.data;
    console.log(data);
    console.log(comp_data);

    this.state = {
      loading: true,
      recording: false,
    };

    // Note for later: Create an array of noises to be played. If a "beat" is recognized
    // then save that note to an array, if no "beat" is recognized then save that unrecognized
    // noise to the array.
    // Use p5 score to playback the series of sounds

    const self = this;
    self._playback_beat = [];
    self._last_sound_at = 0;

    // var p5 = require("p5");
    this.sketch = p => {
      let mic, fft, canvas_freq, analyzer;
      // let bass_fft, snare_fft, open_fft, closed_fft;
      let bass_sound, snare_sound, open_hh_sound, closed_hh_sound;

      let average_sound = 0;

      let output_sounds;
      // let source_sounds;


      // Functions to be used for noise analysis
      p.preload = function() { // For audio analysis
        p.soundFormats('mp3', 'ogg');
        // noise = p.loadSound('beat_box_beats/bass.mp3');
        bass_sound = p.loadSound(bass);
        snare_sound = p.loadSound(snare);
        open_hh_sound = p.loadSound(open_hh);
        closed_hh_sound = p.loadSound(closed_hh);

      };


      p.setup = function() {

        canvas_freq = p.createCanvas(710, 200);
        p.noFill();

        canvas_freq.parent('freq_holder');
        mic = new p5.AudioIn();
        mic.start();
        // console.log("I am recording you");
        fft = new p5.FFT();
        fft.setInput(mic);

        analyzer = new p5.Amplitude();
        analyzer.toggleNormalize([1]);
        analyzer.setInput(mic);

        output_sounds = [ bass_sound, snare_sound, open_hh_sound, closed_hh_sound ];
        // source_sounds = [ bass_noise, snare_noise, open_noise, closed_noise ];

        self.setState({loading: false});
      };

      p.draw = function() {
        p.clear();
        p.strokeWeight(1.5);
        // console.log("I wanna draw");
        // Analyze and display spectrum of frequency
        let spectrum = fft.analyze();
        // console.log(spectrum);
        p.beginShape();
        for (let i = 0; i < spectrum.length; i++) {
          p.vertex(i,
            // p.map(i, 0, 1024, 0, p.width),
            p.map(spectrum[i], 0, 255, p.height, 0)
          );
        }
        p.endShape();
        
        // const values = spectrums.map(spec => {
        //   let sum = 0;
        //   for (let i = 0; i < spectrum.length; i++) {
        //     sum = sum + (spectrum[i] - spec[i]) ^ 2;
        //   }
        //   return sum
        // });

        // console.log(values);

        // values.forEach((v, idx) => {
        //   p.rect(
        //     p.map(idx, 0, values.length, 0, p.width),
        //     0,
        //     p.width / values.length,
        //     p.map(v, 0, 46000, 0, p.height),
        //   );
        // });

        // console.log("Centroid of Freq: " + fft.getCentroid());
        //
        // console.log("Bass Energy of Freq: " + fft.getEnergy("bass"));
        // console.log("lowMid Energy of Freq: " + fft.getEnergy("lowMid"));
        // console.log("mid Energy of Freq: " + fft.getEnergy("mid"));
        // console.log("midHigh Energy of Freq: " + fft.getEnergy("highMid"));
        // console.log("treble Energy of Freq: " + fft.getEnergy("treble"));
        //
        // console.log("Lin Averages of Freq: " + fft.linAverages(4));
        // console.log("Log Averages of Freq: " + fft.logAverages(4));

        // Analyze and interpret amplitude
        let rms = analyzer.getLevel();
        // console.log("Amplitude: " + rms);

        // let bass = false;
        // let snare = false;
        // let hi_hat_o = false;
        // let hi_hat_c = false;

        // Thresholds & Beats based off of input
        // FREQ If certain element of frequency spectrum is greater than some threshold
        // AMP If amplitude level is greater than some threshold
        // MIDI If note returned for frequency value is equal to some value?


        if (!self.state.recording) {
          return;
        }


        // Determine score - Cycle through each spectrum calculate score for each - lowest sum = highest score
        let i;
        let scores = [];
        // debugger;
        // let scoring_comparison = scoring_comparison_data;
        for (i = 0; i < comp_data.length; i++) {
          // debugger;
          let comp_spectrum = comp_data[i][0];
          let j;
          let sum = 0;
          for (j = 0; j < spectrum.length; j++) {
            sum += Math.pow(spectrum[j] - comp_spectrum[j], 2);
          }
          scores.push(sum);
        }
        // console.log(scores);



        const centroids = [
          816, 8980, 10221, 10306
        ];
        const amps = [
          0.058, 0.107, 0.384, 0.4431
        ];

        const centroid = fft.getCentroid();

        const score = (idx) => {
          const c = centroids[idx];
          const a = amps[idx];

          return Math.pow(c - centroid, 2);
        };


        // noise_spectrums =
        // const values = spectrums.map(spec => {
        //   let sum = 0;
        //   for (let i = 0; i < spectrum.length; i++) {
        //     sum = sum + (spectrum[i] - spec[i]) ^ 2;
        //   }
        //   return sum
        // });



        const use = rms > average_sound * 1.5;
        // console.log(average_sound, rms);
        average_sound = average_sound * 0.7 + rms * 0.3;

        if (!use) {
          return;
        }

        let best_idx = 0;
        let best_score = score(0);

        for (let i = 0; i < output_sounds.length; ++i) {
          console.log("new: " + scores[i]);
          console.log("old: " + score(i));
          // const s = score(i);
          const s = scores[i];
          if (s < best_score) {
            best_score = s;
            best_idx = i;
          }
        }

        self.addSound(output_sounds[best_idx]);



        // Build a score (ranks score in relation to bass, snare, open, close) - Build from input and its relation to the user_input tested noise

      };
    };

    this._myp5 = new p5(this.sketch);
  }

  addSound = (sound) => {
    const now = Date.now();
    if (now - this._last_sound_at < 500) {
      return;
    }

    // console.log('sound added');

    this._last_sound_at = now;
    this._playback_beat.push(sound);
    sound.play();
  };

  onMousePress= () => {
    if (this.state.playing) {
      return;
    }

    this.setState({ playing: true });

    let play_idx = 0;

    const playNext = () => {
      if (play_idx >= this._playback_beat.length) {
        this.setState({ playing: false });
        return;
      }

      const sound = this._playback_beat[play_idx++];
      sound.play();
      setTimeout(playNext, sound.duration() * 2000);
    };

    playNext();

  };

 onMousePressClear = () => {
   if (this.state.playing) {
     return;
   }

   // Reset playback beat array
  this._playback_beat.length = 0;

  };


  render = () => {
    const rec_button = this.state.recording
        ? <button className="buttons" type="button" onClick={() => this.setState({recording: false})}>Stop</button>
        : <button className="buttons" type="button" onClick={() => this.setState({recording: true})}>Start</button>;

    return (
        // console.log(this.sketch(p5)),
        <div className={'App' + (this.state.recording ? ' rec' : '')}>
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <p>
              Build-A-Beat
            </p>
            <div id="freq_holder"></div>

            <div id="button_holder">
              {rec_button}
              <button className="buttons" type="button" onClick={this.onMousePress}>Build My Beat</button>
              <button className="buttons" type="button" onClick={this.onMousePressClear}>Clear</button>

            </div>

            {/*Fake export button */}
            <button className="export_button" type="button" >Export</button>

          </div>
        </div>
    );

  }
}
export default App;
