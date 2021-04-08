const postcss = require('postcss');
const plugin = require('./')
const tailwindConfig = '../../tailwind.config.js';

async function run (input, output, opts = {tailwindConfig}) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}

// Write tests here
it('Fails because of no tailwindConfig opt', async () => expect(plugin).toThrow());
it('Removes @ccui-tailwind wrapper', async () => { await run('@ccui-tailwind{ }', ''); });
it('Removes @ccui-tailwind wrapper, but leaves children', async () => { 
  await run('@ccui-tailwind{.foo{color:red;}}', '.foo{color:red;}'); 
});
it('Removes @ccui-tailwind wrapper, but leaves @apply classes', async () => { 
  await run('@ccui-tailwind{.foo{@apply font-sans;}}', '.foo{@apply font-sans;}'); 
});
it('Removes @ccui-tailwind wrapper, removes @rules used by ccui-tailwind', async () => { 
  await run('@ccui-tailwind{@prop border-radius;.foo{@apply font-sans;}}', '.foo{@apply font-sans;}'); 
});
it(`Removes @ccui-tailwind wrapper, but doesn't loop because of missing @prop setting`, async () => { 
  await run('@ccui-tailwind{@themeSetting borderRadius;.foo{@apply font-sans;}}', '.foo{@apply font-sans;}'); 
});
it('Filter @themeSetting via @allow list. Loop over borderRadius @themeSetting, Modify Selector, append @prop border-radius with value(s) from @themeSetting', async () => { 
  await run(
`@ccui-tailwind{
  @themeSetting borderRadius;
  @prop border-radius;
  @allow sm;
  .foo{
    @apply font-sans;
  }
}`, 
`.foo\\:sm{
    @apply font-sans;
    border-radius: 0.125rem
}`); 
});
it('Filter @themeSetting via @filter list. Loop over borderRadius @themeSetting, Modify Selector, append @prop border-radius with value(s) from @themeSetting', async () => { 
  await run(
`@ccui-tailwind{
  @themeSetting borderRadius;
  @prop border-radius;
  @filter md, DEFAULT, lg, xl, 2xl, 3xl;
  .foo{
    @apply font-sans;
  }
}`, 
`.foo\\:sm{
    @apply font-sans;
    border-radius: 0.125rem
}`); 
});