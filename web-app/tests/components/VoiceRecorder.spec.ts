import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createI18n } from 'vue-i18n'
import VoiceRecorder from '@/components/VoiceRecorder.vue'
import he from '@/i18n/locales/he.json'

// Mock MediaRecorder
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstop: null
}

Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockMediaRecorder)
})

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    })
  }
})

// Mock URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mock-audio-url')
})

describe('VoiceRecorder', () => {
  let wrapper: any
  let vuetify: any
  let i18n: any

  beforeEach(() => {
    vuetify = createVuetify()
    i18n = createI18n({
      legacy: false,
      locale: 'he',
      messages: { he }
    })

    wrapper = mount(VoiceRecorder, {
      global: {
        plugins: [vuetify, i18n]
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.find('.voice-recorder').exists()).toBe(true)
    expect(wrapper.find('[data-testid="recording-button"]').exists()).toBe(true)
  })

  it('shows initial state', () => {
    expect(wrapper.text()).toContain('דבר עכשיו')
    expect(wrapper.find('[data-testid="recording-button"]').props('icon')).toBe('mdi-microphone')
  })

  it('starts recording when button is clicked', async () => {
    const button = wrapper.find('[data-testid="recording-button"]')
    await button.trigger('click')

    expect(wrapper.vm.isRecording).toBe(true)
    expect(wrapper.text()).toContain('מקליט...')
  })

  it('stops recording when button is clicked again', async () => {
    const button = wrapper.find('[data-testid="recording-button"]')
    
    // Start recording
    await button.trigger('click')
    expect(wrapper.vm.isRecording).toBe(true)

    // Stop recording
    await button.trigger('click')
    expect(wrapper.vm.isRecording).toBe(false)
  })

  it('shows recording duration', async () => {
    const button = wrapper.find('[data-testid="recording-button"]')
    await button.trigger('click')

    // Simulate recording for 1 second
    await new Promise(resolve => setTimeout(resolve, 100))
    wrapper.vm.recordingDuration = 1

    expect(wrapper.text()).toContain('00:01')
  })

  it('shows waveform when recording', async () => {
    const button = wrapper.find('[data-testid="recording-button"]')
    await button.trigger('click')

    expect(wrapper.find('.waveform').exists()).toBe(true)
  })

  it('handles recording error', async () => {
    // Mock getUserMedia to throw error
    navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'))

    const button = wrapper.find('[data-testid="recording-button"]')
    await button.trigger('click')

    expect(wrapper.vm.error).toBeTruthy()
    expect(wrapper.vm.isSupported).toBe(false)
  })

  it('processes recording after stop', async () => {
    const button = wrapper.find('[data-testid="recording-button"]')
    
    // Start recording
    await button.trigger('click')
    expect(wrapper.vm.isRecording).toBe(true)

    // Stop recording
    await button.trigger('click')
    expect(wrapper.vm.isRecording).toBe(false)
    expect(wrapper.vm.isProcessing).toBe(true)
  })

  it('shows results dialog after processing', async () => {
    const button = wrapper.find('[data-testid="recording-button"]')
    
    // Start and stop recording
    await button.trigger('click')
    await button.trigger('click')

    // Wait for processing to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.vm.showResults).toBe(true)
  })

  it('creates task from voice input', async () => {
    const button = wrapper.find('[data-testid="recording-button"]')
    
    // Start and stop recording
    await button.trigger('click')
    await button.trigger('click')

    // Wait for processing to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Click create task button
    const createTaskButton = wrapper.find('[data-testid="create-task-button"]')
    if (createTaskButton.exists()) {
      await createTaskButton.trigger('click')
    }

    expect(wrapper.vm.showResults).toBe(false)
  })

  it('formats duration correctly', () => {
    expect(wrapper.vm.formatDuration(0)).toBe('00:00')
    expect(wrapper.vm.formatDuration(59)).toBe('00:59')
    expect(wrapper.vm.formatDuration(60)).toBe('01:00')
    expect(wrapper.vm.formatDuration(125)).toBe('02:05')
  })
})
