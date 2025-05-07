import Automizer from '../src/automizer';
import ModifyPresentationHelper from '../src/helper/modify-presentation-helper';

test('Remove slide completely from presentation and archive', async () => {
  const automizer = new Automizer({
    templateDir: `${__dirname}/pptx-templates`,
    outputDir: `${__dirname}/pptx-templates`,
    cleanup: true
  });

  const pres = automizer
    .loadRoot(`threeSlidePres.pptx`)
    .load(`threeSlidePres.pptx`);

  pres.modify(ModifyPresentationHelper.removeSlides([2]));

  await pres.write(`twoSlidePres.pptx`);

  const newPres = automizer.loadRoot(`twoSlidePres.pptx`).load(`twoSlidePres.pptx`);

  // Get presentation info to extract slide details
  const presInfo = await newPres.getInfo();
  const slides = presInfo.slidesByTemplate('twoSlidePres.pptx')
    .map((slide) => {
      return {
        number: slide.number,
        name: slide.info.name,
        shapes: slide.elements
          .filter(
            (shape) =>
              shape.hasTextBody === true && shape.getText().length !== 0
          )
          .map((shape) => {
            const text = shape.getText();

            return {
              name: shape.name,
              type: shape.type,
              text: text,
              position: {
                x: shape.position.x,
                y: shape.position.y,
                cx: shape.position.cx,
                cy: shape.position.cy,
              },
            };
          }),
      };
    });

    expect(slides.length).toEqual(2);

    console.log(JSON.stringify(slides, null, 2));
}); 