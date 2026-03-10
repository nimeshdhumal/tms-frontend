'use client'

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/Link';
import {useAuth} from '@/context/AuthContext';
import {login} from '@/lib/authService';
import toast from 'react-hot-toast';