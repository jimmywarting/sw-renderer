/**
 * The glorius streamable template engine
 *
 * @param  {Array} strings All static content in a template string
 * @param  {Array} values  All items in the array that needs evaluating
 * @return {ReadableStream}
 */
function tpl(strings, ...values) {
  // The stream api accepts only Uint8Array
  // so we use this to convert string to a buffer
  const encoder = new TextEncoder

  // used to loop over each string and values
  let i = 0

  return new ReadableStream({
    async pull(controller) {
      // Close stream when everything is done
      if (i === strings.length) {
        return controller.close()
      }

      // flush string
      controller.enqueue(encoder.encode(strings[i]))

      const value = await (values.length ? values.shift() : '')

      // possible to merge another stream into this stream
      // e.g. if you did this in template:
      // `fetch(url).then(res => res.body)`
      // it would start to stream it's content
      if (value.getReader) {
        // equvulant to stream.pipeTo(dest)
        let reader = value.getReader()
        let pump = () => reader.read().then(result =>
          !result.done && pump(controller.enqueue(result.value))
        )
        await pump()
      } else {
        if (Array.isArray(value)) {
          // This behaves much like react handles array of items and you
          // map all items into a dom fragment, diffrense is this is a
          // async for loop so you can map promises also
          for (let x of value)
            controller.enqueue(encoder.encode(await x))
        } else {
          controller.enqueue(encoder.encode(await value))
        }

      }

      i++
    }
  })
}


class Scope {

  /**
   * Returns a ReadableStream but still binds the class methods to the Template.
   *
   * @param  {String} title    Title used for the page
   * @param  {String} template Template string
   * @return {ReadableStream}  returs a streamable template
   */
  constructor(title, template) {
    this.title = title

    return new Function('return tpl`'+template+'`').call(this, tpl)
  }


  /**
   * Escape html special chars
   *
   * @param  {String} unsafeText Unsafe text
   * @return {String}            Safe text
   */
  escapeHtml(unsafeText) {
    return unsafeText
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /**
   * Load another partial (template file)
   *
   * @param  {String}  src  Absolute path
   * @return {Promise}      The template engine resolves promises
   */
  async load(src) {
    const res = await fetchAndStore(src)
    const template = await res.text()

    return new Function('return tpl`'+template+'`').call(this, tpl)
  }
}
