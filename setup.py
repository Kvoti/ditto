#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys


try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

import kvoti
version = kvoti.__version__

setup(
    name='kvoti',
    version=version,
    author='',
    author_email='mark@kvoti.technology',
    packages=[
        'kvoti',
    ],
    include_package_data=True,
    install_requires=[
        'Django>=1.7.1',
    ],
    zip_safe=False,
    scripts=['kvoti/manage.py'],
)
