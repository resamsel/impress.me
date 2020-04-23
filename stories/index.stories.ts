export default {title: 'Button'};

export const demo = () => '<iframe class="fullscreen" src="/Demo.html"></iframe>';

export const withEmoji = () => {
  const button = document.createElement('button');
  button.innerText = '😀 😎 👍 💯';
  return button;
};
