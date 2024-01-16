module Util exposing (noBytes)

import Bytes exposing (Bytes)
import Bytes.Encode


noBytes : Bytes
noBytes =
    Bytes.Encode.encode (Bytes.Encode.sequence [])
