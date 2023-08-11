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
      case '!=': filter_str_different(data_key, spec.val, false); break;
      case '<':  filter_num_lt(data_key, val); break;
      case '<=': filter_num_le(data_key, val); break;
      case '>':  filter_num_gt(data_key, val); break;
      case '>=': filter_num_ge(data_key, val); break;
      default: alert(`Unknown comparison '${op}'!`); break;
    }
  }
}

const SPEC_REGEX = /^([a-zA-Z0-9-_]+)\s*([<=>!]+)\s*(.+)$/;

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
    fixed_params.push(val ? `${key}=${val}` : key);
  }
  return fixed_params;
}

function filter_num_ge(key, value) {
  filter_num(key, value,
             (x, limit) => parseFloat(elt.getAttribute(key)) >= limit);
}

function filter_num_gt(key, value) {
  filter_num(key, value,
             (x, limit) => parseFloat(elt.getAttribute(key)) > limit);
}

function filter_num_le(key, value) {
  filter_num(key, value,
             (x, limit) => parseFloat(elt.getAttribute(key)) <= limit);
}

function filter_num_lt(key, value) {
  filter_num(key, value,
             (x, limit) => parseFloat(elt.getAttribute(key)) > limit);
}

function filter_num(key, value, comp_fn) {
  const limit = parseFloat(value);
  const all  = document.querySelectorAll(`[${key}]`);
  if (all.length === 0) alert(`WARNING: No elements have attribute ${key}!`);
  for (elt of all) {
    if (! comp_fn(parseFloat(elt.getAttribute(key)), limit)) {
      elt.style.display = 'none';
    }
  }
}

function filter_str_different(key, value) {
  const all = document.querySelectorAll(`[${key}="${value}"]`);
  if (all.length === 0) {
    alert(`WARNING: No elements have value ${value} for attribute ${key}!`);
  } else {
    for (elt of all) elt.style.display = 'none';
  }
}

function filter_str_same(key, value) {
  const all = document.querySelectorAll(`[${key}]`);
  if (all.length === 0) {
    alert(`WARNING: No elements have attribute ${key}!`);
  } else {
    for (e of all) if (e.getAttribute(key) != value) e.style.display = 'none';
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
