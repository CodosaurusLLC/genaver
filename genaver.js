/*
 * genaver.js
 * System to GENerate A VERsion of something that exists in HTML.
 * See README.md for details.
 * version 0.0.1
 *
 * Example URL to override the specs given in the HTML:
 * genaver-demo.html?human-lang=spanish&not-human-lang=french&max-time>20&min-time<=20&var-city=Malaga&var-conf=jotb&var-year=23
 *
 * TODO:
 * - Make only generate_version public; package so rest is private
 */

function generate_version(args=[]) {
  const url_params = Array.from(new URLSearchParams(window.location.search));
  var   specs;

  specs = parse_specs(args, {});
  specs = parse_specs(fix_url_params(url_params), specs);

  for (const key of Object.keys(specs)) {
    var op, val;
    [op, val] = specs[key];
    var data_key = `data-${key}`;
    switch(op) {
      case '=':
        if (key.slice(0, 4) == 'var-') sub_vars(key, val);
        else filter_str_same(data_key, val);
        break;
      case '!=': filter_str_diff(data_key, spec.val, false); break;
      case '@':  filter_num_at(data_key, val); break;
      case '<':  filter_num(data_key, val, is_lt); break;
      case '<=': filter_num(data_key, val, is_le); break;
      case '>':  filter_num(data_key, val, is_gt); break;
      case '>=': filter_num(data_key, val, is_ge); break;
      default: alert(`Unknown comparison '${op}'!`); break;
    }
  }
}

const SPEC_REGEX = /^([a-zA-Z0-9-_]+)\s*([<=>!@]+)\s*(.+)$/;

function parse_specs(args, so_far) {
  for (var arg of args) {
    var key, op, val;
    [key, op, val] = SPEC_REGEX.exec(arg).slice(1, 4);
    so_far[key] = [op, val];
  }
  return so_far;
}

// needed cuz URL params split on =,
// and we may have multiple or none
// in a Genaver filter spec
function fix_url_params(url_params) {
  const fixed_params = [];
  for (var [key, val] of url_params) {
    if (key.startsWith('gv-')) {
      const key2 = key.replace(/^gv-/, '');
      fixed_params.push(val ? `${key2}=${val}` : key2);
    }
  }
  return fixed_params;
}

function filter_num_at(key, value) {
  filter_num(`${key}-min`, value, is_le);
  filter_num(`${key}-max`, value, is_ge);
}

function is_ge(x, limit) { return x >= limit }
function is_gt(x, limit) { return x >  limit }
function is_le(x, limit) { return x <= limit }
function is_lt(x, limit) { return x <  limit }

function filter_num(key, value, comp_fn) {
  const limit = parseInt(value);
  const all = document.querySelectorAll(`[${key}]`);
  if (all.length === 0) alert(`WARNING: No elements have attribute ${key}!`);
  for (elt of all) {
    if (! comp_fn(parseInt(elt.getAttribute(key)), limit)) elt.remove();
  }
}

function filter_str_diff(key, value) {
  const all = document.querySelectorAll(`[${key}="${value}"]`);
  if (all.length === 0) {
    alert(`WARNING: No elements have value ${value} for attribute ${key}!`);
    return;
  }
  for (elt of all) elt.remove();
}

function filter_str_same(key, value) {
  const all = document.querySelectorAll(`[${key}]`);
  if (all.length === 0) {
    alert(`WARNING: No elements have attribute ${key}!`);
    return;
  }
  for (elt of all) {
    if (elt.getAttribute(key) != value) elt.remove();
  }
}

function sub_vars(key, value) {
  const ATTR = 'data-gv-var';
  const real_key = key.slice(4, key.length);
  const good = document.querySelectorAll(`[${ATTR}="${real_key}"]`);
  if (good.length === 0) {
    alert(`WARNING: No elements have value ${real_key} for attribute ${ATTR}!`);
  }
  for (elt of good) elt.innerText = value;
}
