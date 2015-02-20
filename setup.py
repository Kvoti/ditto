#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys


try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

import ditto
version = ditto.__version__

setup(
    name='ditto',
    version=version,
    author='',
    author_email='mark@digital-impacts.com',
    packages=[
        'ditto',
    ],
    include_package_data=True,
    install_requires=[
        'Django>=1.7.1',
    ],
    zip_safe=False,
    scripts=['ditto/manage.py'],
)
