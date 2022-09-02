import { find, forEach } from "lodash"

function loopProcessors (processors, processorId) {

}

export const getProcessorById = (processors, id) {
  let target = find(processors, {processorId: id})
  if (!target) {
    
  }
  return target
  forEach(processors, item => {
    if (item.processorId === processorId) {
      return item
    } else {

    }
  })
}