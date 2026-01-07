import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  const mockReadText = vi.fn();
  const mockWriteText = vi.fn();

  Object.defineProperty(navigator, 'clipboard', {
    value: { readText: mockReadText, writeText: mockWriteText },
    configurable: true,
  });

  afterEach(() => {
    mockReadText.mockClear();
    mockWriteText.mockClear();
  });

  it('should be defined', () => {
    expect(useClipboard).toBeDefined();
  });

  it('should read from clipboard', async () => {
    mockReadText.mockResolvedValue('hello');
    const TestComponent = defineComponent({
      template: '<div>{{ text }}</div>',
      setup() {
        const { text, read } = useClipboard();
        read();
        return { text };
      },
    });
    const wrapper = mount(TestComponent);
    await nextTick();
    expect(mockReadText).toHaveBeenCalled();
    expect(wrapper.text()).toBe('hello');
  });

  it('should write to clipboard', async () => {
    const TestComponent = defineComponent({
      template: '<div>{{ text }}</div>',
      setup() {
        const { text, write } = useClipboard();
        write('world');
        return { text };
      },
    });
    const wrapper = mount(TestComponent);
    await nextTick();
    expect(mockWriteText).toHaveBeenCalledWith('world');
    expect(wrapper.text()).toBe('world');
  });
});
