import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { useHash } from './useHash';

describe('useHash', () => {
  it('should be defined', () => {
    expect(useHash).toBeDefined();
  });

  it('should return the initial hash', () => {
    window.location.hash = '#initial';
    const TestComponent = defineComponent({
      template: '<div>{{ hash }}</div>',
      setup() {
        const hash = useHash();
        return { hash };
      },
    });
    const wrapper = mount(TestComponent);
    expect(wrapper.text()).toBe('#initial');
  });

  it('should update hash on hashchange event', async () => {
    window.location.hash = '#start';
    const TestComponent = defineComponent({
      template: '<div>{{ hash }}</div>',
      setup() {
        const hash = useHash();
        return { hash };
      },
    });
    const wrapper = mount(TestComponent);

    expect(wrapper.text()).toBe('#start');

    window.location.hash = '#updated';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toBe('#updated');
  });
});
