from django import template

register = template.Library()

@register.filter(name='split_string')
def split_string(value, separator):
    return value.split(separator)