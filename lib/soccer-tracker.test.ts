import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTimestampToSeconds,
  formatSecondsToTimestamp,
  extractYoutubeVideoId,
  buildYoutubeEmbedUrl,
  calculateSpikeUsage,
  calculateDashboardStats,
  filterRecords,
  validateNewRecord,
  INITIAL_SPIKES,
  INITIAL_RECORDS,
} from './soccer-tracker';

test('parseTimestampToSeconds parses MM:SS and HH:MM:SS and rejects invalid strings', () => {
  assert.equal(parseTimestampToSeconds('12:34'), 754);
  assert.equal(parseTimestampToSeconds('04:15'), 255);
  assert.equal(parseTimestampToSeconds('1:05:20'), 3920);
  assert.equal(parseTimestampToSeconds('45'), 45);
  assert.equal(parseTimestampToSeconds('12:65'), null);
  assert.equal(parseTimestampToSeconds('abc'), null);
  assert.equal(parseTimestampToSeconds(''), null);
});

test('formatSecondsToTimestamp formats seconds properly', () => {
  assert.equal(formatSecondsToTimestamp(754), '12:34');
  assert.equal(formatSecondsToTimestamp(65), '01:05');
  assert.equal(formatSecondsToTimestamp(3920), '1:05:20');
});

test('extractYoutubeVideoId and buildYoutubeEmbedUrl handle standard, short, and embed URLs', () => {
  assert.equal(extractYoutubeVideoId('https://www.youtube.com/watch?v=aqz-KE-bpKQ'), 'aqz-KE-bpKQ');
  assert.equal(extractYoutubeVideoId('https://youtu.be/aqz-KE-bpKQ?t=120'), 'aqz-KE-bpKQ');
  assert.equal(extractYoutubeVideoId('https://www.youtube.com/embed/aqz-KE-bpKQ'), 'aqz-KE-bpKQ');
  assert.equal(extractYoutubeVideoId('https://example.com/video'), null);

  const embedUrl = buildYoutubeEmbedUrl('https://www.youtube.com/watch?v=aqz-KE-bpKQ', 754, true);
  assert.equal(embedUrl, 'https://www.youtube.com/embed/aqz-KE-bpKQ?rel=0&start=754&autoplay=1');
});

test('calculateSpikeUsage aggregates counts and minutes accurately', () => {
  const usage = calculateSpikeUsage(INITIAL_SPIKES, INITIAL_RECORDS);
  const morelia = usage['spike-mizuno-morelia-2'];
  const dslight = usage['spike-asics-dslight-xfly'];

  assert.equal(morelia.usageCount, 1);
  assert.equal(morelia.totalMinutes, 40);
  assert.equal(dslight.usageCount, 2);
  assert.equal(dslight.totalMinutes, 105);
});

test('calculateDashboardStats computes averages and totals', () => {
  const summary = calculateDashboardStats(INITIAL_RECORDS);
  assert.equal(summary.totalMatches, 3);
  assert.equal(summary.totalMinutes, 145);
  assert.equal(summary.officialMatchCount, 1);
  assert.equal(summary.practiceMatchCount, 1);
  assert.equal(summary.trainingCount, 1);
  assert.equal(summary.averageScores.tactical, 4);
});

test('filterRecords filters by match type and keyword', () => {
  const officialOnly = filterRecords(INITIAL_RECORDS, '公式戦', '');
  assert.equal(officialOnly.length, 1);
  assert.equal(officialOnly[0].id, 'rec-2026-10-18');

  const keywordMatch = filterRecords(INITIAL_RECORDS, 'ALL', 'ダイアゴナルラン');
  assert.equal(keywordMatch.length, 1);
  assert.equal(keywordMatch[0].id, 'rec-2026-10-11');
});

test('validateNewRecord checks required fields', () => {
  assert.equal(
    validateNewRecord({
      date: '2026-10-21',
      opponent: 'FCテスト',
      minutesPlayed: 40,
      goodPlays: 'トラップが良かった',
      challenges: '',
    }).valid,
    true
  );

  assert.equal(
    validateNewRecord({
      date: '2026-10-21',
      opponent: '',
      minutesPlayed: 40,
      goodPlays: 'トラップが良かった',
      challenges: '',
    }).valid,
    false
  );
});
