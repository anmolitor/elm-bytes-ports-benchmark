module Model exposing (..)

import Bytes exposing (Bytes)
import Json.Encode
import Util


type alias Model =
    { bytes : Bytes
    , value : Json.Encode.Value
    }


init : Model
init =
    { bytes = Util.noBytes, value = Json.Encode.null }
