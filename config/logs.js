'use strict';

const morgan = require('morgan');
const colors = require('colors');
const _ = require('lodash');

module.exports = morgan((tokens, req, res) => {
  let log = []

  /* ==================== 
   * Worker / Time
   * ==================== */

  let d = new Date();
  log.push(`${_.padStart(d.toLocaleDateString(),10,'0')}${colors.grey('|')}${_.padStart(d.toLocaleTimeString(), 11, '0')}`)
  // log.push(d.toISOString())

  if(CONFIG.process.threads > 1) log.push(colors.process(`${process.pid}:`))

  /* ==================== 
   * Method
   * ==================== */

  let method = tokens.method(req,res)
  if(['POST'].includes(method)) method = colors.green(method)
  else if(['OPTIONS','HEADER','CONNECT','TRACE'].includes(method)) method = colors.yellow(method)
  else if(['PATCH','PUT'].includes(method)) method = colors.blue(method)
  else if(['DELETE'].includes(method)) method = colors.red(method)

  /* ==================== 
   * Status
   * ==================== */

  let status = tokens.status(req, res)
  if(status % 500 < 100) log.push(colors.red(status))
  else if(status % 400 < 100) log.push(colors.yellow(status))
  else if(status % 300 < 100) log.push(colors.cyan(status))
  else if(status % 200 < 100) log.push(colors.green(status))

  log.push(_.padEnd(method, 7, ' '))

  /* ==================== 
   * Response Time
   * ==================== */

  let responseTime = tokens['response-time'](req,res)
  if(responseTime < 50) responseTime = colors.green(`${responseTime} ms`)
  else if(responseTime < 100) responseTime = `${responseTime} ms`
  else if(responseTime < 500) responseTime = colors.yellow(`${responseTime} ms`)
  else responseTime = colors.red(`${responseTime} ms`)
  log.push(_.padEnd(responseTime, 12, ' '))

  /* ==================== 
   * Content Length
   * ==================== */

  let contentLength = Number(tokens.res(req, res, 'content-length'))
  if(contentLength.toString().length > 6) log.push(contentLength.toExponential())
  else log.push(contentLength || '-')

  /* ==================== 
   * URL
   * ==================== */

  let url = tokens.url(req,res).split(/(?=\?)/)
  if(url[1]) url[1] = colors.gray(url[1]) 
  log.push(url.join(''));

  /* ==================== 
   * Finishing Steps
   * ==================== */

  return log.join('\t');

})

