import React from 'react'
import {
  render,
  fireEvent,
  waitFor,
  cleanup
} from '@testing-library/react/pure'
import ACCEPT_SUBMISSION from '../graphql/queries/acceptSubmission'
import ReviewCard, { DiffView } from './ReviewCard'
import { MockedProvider } from '@apollo/client/testing'
import _ from 'lodash'

// correct javascript submission
const JsDiff =
  'diff --git a/js7/1.js b/js7/1.js\nindex 9c96b34..853bddf 100644\n--- a/js7/1.js\n+++ b/js7/1.js\n@@ -1,8 +1,19 @@\n-// write your code here!\n const solution = () => {\n-  // global clear all timeout:\n+  const allT = [];\n+  const old = setTimeout;\n+  window.setTimeout = (func, delay) => {\n+    const realTimeout = old(func, delay);\n+    allT.push(realTimeout);\n+    return realTimeout;\n+  };\n+  window.clearAllTimouts = () => {\n+    while (allT.length) {\n+      clearTimeout(allT.pop());\n+    }\n+  };\n   cat = () => {\n-  }\n+    window.clearAllTimouts();\n+  };\n };\n \n module.exports = solution;'
// a/js7/1.c b/js7/1.c instead of a/js7/1.js b/js7/1.js
const NonJsDiff =
  'diff --git a/js7/1.c b/js7/1.c\nindex 9c96b34..853bddf 100644\n--- a/js7/1.c\n+++ b/js7/1.c\n@@ -1,8 +1,19 @@\n-// write your code here!\n const solution = () => {\n-  // global clear all timeout:\n+  const allT = [];\n+  const old = setTimeout;\n+  window.setTimeout = (func, delay) => {\n+    const realTimeout = old(func, delay);\n+    allT.push(realTimeout);\n+    return realTimeout;\n+  };\n+  window.clearAllTimouts = () => {\n+    while (allT.length) {\n+      clearTimeout(allT.pop());\n+    }\n+  };\n   cat = () => {\n-  }\n+    window.clearAllTimouts();\n+  };\n };\n \n module.exports = solution;'
// a/js7/1 b/js7/1 instead of a/js7/1.js b/js7/1.js
const IncorrectDiff =
  'diff --git a/js7/1.c b/js7/1.c\nindex 9c96b34..853bddf 100644\n--- a/js7/1\n+++ b/js7/1\n@@ -1,8 +1,19 @@\n-// write your code here!\n const solution = () => {\n-  // global clear all timeout:\n+  const allT = [];\n+  const old = setTimeout;\n+  window.setTimeout = (func, delay) => {\n+    const realTimeout = old(func, delay);\n+    allT.push(realTimeout);\n+    return realTimeout;\n+  };\n+  window.clearAllTimouts = () => {\n+    while (allT.length) {\n+      clearTimeout(allT.pop());\n+    }\n+  };\n   cat = () => {\n-  }\n+    window.clearAllTimouts();\n+  };\n };\n \n module.exports = solution;'
// .. instead of a/js7/1.js b/js7/1.js
const InCompleteDiff =
  'diff --git a/js7/1.c b/js7/1.c\nindex 9c96b34..853bddf 100644\n--- a/.\n+++ b/.\n@@ -1,8 +1,19 @@\n-// write your code here!\n const solution = () => {\n-  // global clear all timeout:\n+  const allT = [];\n+  const old = setTimeout;\n+  window.setTimeout = (func, delay) => {\n+    const realTimeout = old(func, delay);\n+    allT.push(realTimeout);\n+    return realTimeout;\n+  };\n+  window.clearAllTimouts = () => {\n+    while (allT.length) {\n+      clearTimeout(allT.pop());\n+    }\n+  };\n   cat = () => {\n-  }\n+    window.clearAllTimouts();\n+  };\n };\n \n module.exports = solution;'
// a/js7/1.c instead of a/js7/1.js b/js7/1.js
const NoNewPathDiff =
  'diff --git a/js7/1.c b/js7/1.c\nindex 9c96b34..853bddf 100644\n--- a/js7/1.c\n+++ b/\n@@ -1,8 +1,19 @@\n-// write your code here!\n const solution = () => {\n-  // global clear all timeout:\n+  const allT = [];\n+  const old = setTimeout;\n+  window.setTimeout = (func, delay) => {\n+    const realTimeout = old(func, delay);\n+    allT.push(realTimeout);\n+    return realTimeout;\n+  };\n+  window.clearAllTimouts = () => {\n+    while (allT.length) {\n+      clearTimeout(allT.pop());\n+    }\n+  };\n   cat = () => {\n-  }\n+    window.clearAllTimouts();\n+  };\n };\n \n module.exports = solution;'

const submissionData = {
  id: '1',
  status: 'active',
  mrUrl: '',
  diff: JsDiff,
  viewCount: 0,
  comment: 'Some comment',
  order: 0,
  challengeId: '146',
  lessonId: '2',
  user: {
    username: 'fake user',
    id: '1'
  },
  challenge: { title: 'fake challenge' },
  reviewer: {
    id: '1',
    username: 'fake reviewer'
  },
  createdAt: '123',
  updatedAt: '123'
}
const mocks = [
  {
    request: {
      query: ACCEPT_SUBMISSION,
      variables: { id: '1', comment: 'good job' }
    },
    result: {
      data: {
        acceptSubmission: {
          id: '1',
          comment: 'good job',
          status: 'passed'
        }
      }
    }
  }
]
describe('ReviewCard Component', () => {
  test('Should render submissions in other languages', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <ReviewCard
          submissionData={{ ...submissionData, diff: NonJsDiff }}
          addTypeName={false}
        />
      </MockedProvider>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render no diff input', async () => {
    const NoDiffSumbisson = _.cloneDeep(submissionData)
    delete NoDiffSumbisson.diff
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <DiffView submissionData={NoDiffSumbisson} addTypeName={false} />
      </MockedProvider>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render incorrect diff', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <ReviewCard
          submissionData={{ ...submissionData, diff: IncorrectDiff }}
          addTypeName={false}
        />
      </MockedProvider>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should render incomplete diff', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <ReviewCard
          submissionData={{ ...submissionData, diff: InCompleteDiff }}
          addTypeName={false}
        />
      </MockedProvider>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should render single path submission', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <ReviewCard
          submissionData={{ ...submissionData, diff: NoNewPathDiff }}
          addTypeName={false}
        />
      </MockedProvider>
    )
    expect(container).toMatchSnapshot()
    cleanup()
  })
  test('Should be able to accept submission', async () => {
    console.log(submissionData)
    const { container, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <ReviewCard submissionData={submissionData} addTypeName={false} />
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox', { name: '' }), {
      target: { value: 'Good job!' }
    })
    await waitFor(() =>
      fireEvent.click(getByRole('button', { name: 'Accept' }))
    )
    expect(container).toMatchSnapshot()
  })
})
